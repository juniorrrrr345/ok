import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import bcrypt from 'bcryptjs';

type Bindings = {
  DB: D1Database;
  BUCKET: R2Bucket;
  ADMIN_PASSWORD: string;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS configuration
app.use('/*', cors({
  origin: ['http://localhost:3000', 'https://maboutique.vercel.app'],
  credentials: true,
}));

// Public routes
app.get('/api/products', async (c) => {
  try {
    const { category, farm } = c.req.query();
    
    let query = `
      SELECT p.*, c.name as category_name, f.name as farm_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN farms f ON p.farm_id = f.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (category && category !== 'all') {
      query += ' AND p.category_id = ?';
      params.push(category);
    }
    
    if (farm && farm !== 'all') {
      query += ' AND p.farm_id = ?';
      params.push(farm);
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    const result = await c.env.DB.prepare(query).bind(...params).all();
    return c.json({ products: result.results });
  } catch (error) {
    return c.json({ error: 'Failed to fetch products' }, 500);
  }
});

app.get('/api/categories', async (c) => {
  try {
    const result = await c.env.DB.prepare('SELECT * FROM categories ORDER BY name').all();
    return c.json({ categories: result.results });
  } catch (error) {
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
});

app.get('/api/farms', async (c) => {
  try {
    const result = await c.env.DB.prepare('SELECT * FROM farms ORDER BY name').all();
    return c.json({ farms: result.results });
  } catch (error) {
    return c.json({ error: 'Failed to fetch farms' }, 500);
  }
});

app.get('/api/config', async (c) => {
  try {
    const result = await c.env.DB.prepare('SELECT key, value FROM config').all();
    const config: Record<string, string> = {};
    
    for (const row of result.results as any[]) {
      config[row.key] = row.value || '';
    }
    
    return c.json({ config });
  } catch (error) {
    return c.json({ error: 'Failed to fetch config' }, 500);
  }
});

app.get('/api/carousel', async (c) => {
  try {
    const result = await c.env.DB.prepare(
      'SELECT * FROM carousel_images WHERE active = 1 ORDER BY order_index'
    ).all();
    return c.json({ images: result.results });
  } catch (error) {
    return c.json({ error: 'Failed to fetch carousel images' }, 500);
  }
});

// Admin authentication
app.post('/api/admin/login', async (c) => {
  try {
    const { password } = await c.req.json();
    
    const isValid = await bcrypt.compare(password, c.env.ADMIN_PASSWORD);
    
    if (!isValid) {
      return c.json({ error: 'Invalid password' }, 401);
    }
    
    // Create a simple token (in production, use proper JWT)
    const token = btoa(JSON.stringify({ 
      admin: true, 
      timestamp: Date.now() 
    }));
    
    return c.json({ token, success: true });
  } catch (error) {
    return c.json({ error: 'Authentication failed' }, 500);
  }
});

// Admin middleware
const adminAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const token = authHeader.substring(7);
    const decoded = JSON.parse(atob(token));
    
    // Check if token is valid and not expired (24 hours)
    if (!decoded.admin || Date.now() - decoded.timestamp > 86400000) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }
    
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

// Admin routes
app.use('/api/admin/*', adminAuth);

// Products CRUD
app.post('/api/admin/products', async (c) => {
  try {
    const { name, description, price, image_url, category_id, farm_id } = await c.req.json();
    
    const result = await c.env.DB.prepare(
      'INSERT INTO products (name, description, price, image_url, category_id, farm_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(name, description, price, image_url, category_id, farm_id).run();
    
    return c.json({ success: true, id: result.meta.last_row_id });
  } catch (error) {
    return c.json({ error: 'Failed to create product' }, 500);
  }
});

app.put('/api/admin/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { name, description, price, image_url, category_id, farm_id } = await c.req.json();
    
    await c.env.DB.prepare(
      'UPDATE products SET name = ?, description = ?, price = ?, image_url = ?, category_id = ?, farm_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(name, description, price, image_url, category_id, farm_id, id).run();
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to update product' }, 500);
  }
});

app.delete('/api/admin/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await c.env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to delete product' }, 500);
  }
});

// Categories CRUD
app.post('/api/admin/categories', async (c) => {
  try {
    const { name } = await c.req.json();
    const result = await c.env.DB.prepare(
      'INSERT INTO categories (name) VALUES (?)'
    ).bind(name).run();
    return c.json({ success: true, id: result.meta.last_row_id });
  } catch (error) {
    return c.json({ error: 'Failed to create category' }, 500);
  }
});

app.delete('/api/admin/categories/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await c.env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to delete category' }, 500);
  }
});

// Farms CRUD
app.post('/api/admin/farms', async (c) => {
  try {
    const { name } = await c.req.json();
    const result = await c.env.DB.prepare(
      'INSERT INTO farms (name) VALUES (?)'
    ).bind(name).run();
    return c.json({ success: true, id: result.meta.last_row_id });
  } catch (error) {
    return c.json({ error: 'Failed to create farm' }, 500);
  }
});

app.delete('/api/admin/farms/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await c.env.DB.prepare('DELETE FROM farms WHERE id = ?').bind(id).run();
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to delete farm' }, 500);
  }
});

// Config update
app.put('/api/admin/config', async (c) => {
  try {
    const updates = await c.req.json();
    
    for (const [key, value] of Object.entries(updates)) {
      await c.env.DB.prepare(
        'UPDATE config SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?'
      ).bind(value, key).run();
    }
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to update config' }, 500);
  }
});

// Carousel management
app.post('/api/admin/carousel', async (c) => {
  try {
    const { image_url, title, order_index } = await c.req.json();
    const result = await c.env.DB.prepare(
      'INSERT INTO carousel_images (image_url, title, order_index) VALUES (?, ?, ?)'
    ).bind(image_url, title, order_index || 0).run();
    return c.json({ success: true, id: result.meta.last_row_id });
  } catch (error) {
    return c.json({ error: 'Failed to add carousel image' }, 500);
  }
});

app.delete('/api/admin/carousel/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await c.env.DB.prepare('DELETE FROM carousel_images WHERE id = ?').bind(id).run();
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to delete carousel image' }, 500);
  }
});

// Image upload to R2
app.post('/api/admin/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    const fileName = `${Date.now()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    
    await c.env.BUCKET.put(fileName, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });
    
    // Return the public URL (you'll need to configure R2 public access)
    const url = `https://pub-YOUR-ACCOUNT-ID.r2.dev/${fileName}`;
    
    return c.json({ url });
  } catch (error) {
    return c.json({ error: 'Failed to upload image' }, 500);
  }
});

export default app;