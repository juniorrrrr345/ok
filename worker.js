/**
 * Boutique Cloudflare - Worker Principal
 * API e-commerce avec D1 (base de données) et R2 (images)
 * Remplace MongoDB + Cloudinary
 */

// Configuration CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Utilitaires
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}

// Authentification simple (JWT basique)
function generateToken(userId) {
  const payload = { userId, exp: Date.now() + (24 * 60 * 60 * 1000) }; // 24h
  return btoa(JSON.stringify(payload));
}

function verifyToken(token) {
  try {
    const payload = JSON.parse(atob(token));
    return Date.now() < payload.exp ? payload : null;
  } catch {
    return null;
  }
}

// Hash password simple (en production, utilisez bcrypt)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default {
  async fetch(request, env) {
    // Gestion CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      // Routes API
      if (path.startsWith('/api/')) {
        return await handleAPI(request, env, path, method);
      }

      // Page d'accueil simple
      if (path === '/') {
        return new Response(getHomePage(), {
          headers: { 'Content-Type': 'text/html', ...corsHeaders }
        });
      }

      // 404
      return errorResponse('Route non trouvée', 404);

    } catch (error) {
      console.error('Erreur worker:', error);
      return errorResponse('Erreur serveur interne', 500);
    }
  }
};

async function handleAPI(request, env, path, method) {
  const segments = path.split('/').filter(Boolean);
  const endpoint = segments[1]; // api/[endpoint]
  const id = segments[2]; // api/endpoint/[id]

  // Routes publiques
  switch (`${method} ${endpoint}`) {
    case 'GET products':
      return await getProducts(env, request.url);
    
    case 'GET products':
      if (id) return await getProduct(env, id);
      return await getProducts(env, request.url);
    
    case 'POST auth':
      return await handleAuth(request, env);
    
    case 'POST register':
      return await handleRegister(request, env);
  }

  // Routes protégées (nécessitent authentification)
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const user = token ? verifyToken(token) : null;
  
  if (!user) {
    return errorResponse('Token manquant ou invalide', 401);
  }

  switch (`${method} ${endpoint}`) {
    case 'GET cart':
      return await getCart(env, user.userId);
    
    case 'POST cart':
      return await addToCart(request, env, user.userId);
    
    case 'PUT cart':
      return await updateCartItem(request, env, user.userId, id);
    
    case 'DELETE cart':
      return await removeFromCart(env, user.userId, id);
    
    case 'POST orders':
      return await createOrder(request, env, user.userId);
    
    case 'GET orders':
      return await getUserOrders(env, user.userId);
    
    case 'POST upload':
      return await uploadImage(request, env);
    
    // Routes admin
    case 'POST products':
      return await createProduct(request, env, user);
    
    case 'PUT products':
      return await updateProduct(request, env, user, id);
    
    case 'DELETE products':
      return await deleteProduct(env, user, id);
  }

  return errorResponse('Endpoint non trouvé', 404);
}

// === PRODUITS ===
async function getProducts(env, requestUrl) {
  const url = new URL(requestUrl);
  const category = url.searchParams.get('category');
  const search = url.searchParams.get('search');
  const limit = parseInt(url.searchParams.get('limit')) || 20;
  const offset = parseInt(url.searchParams.get('offset')) || 0;

  let query = `
    SELECT p.*, c.name as category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    WHERE p.active = true
  `;
  const params = [];

  if (category) {
    query += ' AND c.name = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const { results } = await env.DB.prepare(query).bind(...params).all();
  
  return jsonResponse({
    products: results.map(p => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : []
    })),
    pagination: { limit, offset, total: results.length }
  });
}

async function getProduct(env, id) {
  const { results } = await env.DB.prepare(`
    SELECT p.*, c.name as category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    WHERE p.id = ? AND p.active = true
  `).bind(id).all();

  if (results.length === 0) {
    return errorResponse('Produit non trouvé', 404);
  }

  const product = results[0];
  product.images = product.images ? JSON.parse(product.images) : [];

  return jsonResponse({ product });
}

async function createProduct(request, env, user) {
  // Vérifier les permissions admin
  const userInfo = await env.DB.prepare('SELECT role FROM users WHERE id = ?').bind(user.userId).first();
  if (userInfo?.role !== 'admin') {
    return errorResponse('Permissions insuffisantes', 403);
  }

  const { name, description, price, stock, category_id, sku, images } = await request.json();

  const { success } = await env.DB.prepare(`
    INSERT INTO products (name, description, price, stock, category_id, sku, images)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(name, description, price, stock, category_id, sku, JSON.stringify(images || [])).run();

  if (!success) {
    return errorResponse('Erreur lors de la création du produit');
  }

  return jsonResponse({ message: 'Produit créé avec succès' }, 201);
}

// === AUTHENTIFICATION ===
async function handleAuth(request, env) {
  const { email, password } = await request.json();
  
  const user = await env.DB.prepare('SELECT id, password_hash, role FROM users WHERE email = ?').bind(email).first();
  
  if (!user) {
    return errorResponse('Email ou mot de passe incorrect', 401);
  }

  const passwordHash = await hashPassword(password);
  if (passwordHash !== user.password_hash) {
    return errorResponse('Email ou mot de passe incorrect', 401);
  }

  const token = generateToken(user.id);
  
  return jsonResponse({
    token,
    user: { id: user.id, email, role: user.role }
  });
}

async function handleRegister(request, env) {
  const { email, password, name } = await request.json();
  
  // Vérifier si l'email existe déjà
  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existing) {
    return errorResponse('Cet email est déjà utilisé', 409);
  }

  const passwordHash = await hashPassword(password);
  
  const { success } = await env.DB.prepare(`
    INSERT INTO users (email, password_hash, name)
    VALUES (?, ?, ?)
  `).bind(email, passwordHash, name).run();

  if (!success) {
    return errorResponse('Erreur lors de la création du compte');
  }

  return jsonResponse({ message: 'Compte créé avec succès' }, 201);
}

// === PANIER ===
async function getCart(env, userId) {
  const { results } = await env.DB.prepare(`
    SELECT ci.*, p.name, p.price, p.image_url
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
  `).bind(userId).all();

  const total = results.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return jsonResponse({ cart: results, total });
}

async function addToCart(request, env, userId) {
  const { product_id, quantity = 1 } = await request.json();

  // Vérifier le stock
  const product = await env.DB.prepare('SELECT stock FROM products WHERE id = ? AND active = true').bind(product_id).first();
  if (!product || product.stock < quantity) {
    return errorResponse('Stock insuffisant', 400);
  }

  // Ajouter ou mettre à jour le panier
  const { success } = await env.DB.prepare(`
    INSERT INTO cart_items (user_id, product_id, quantity)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, product_id) 
    DO UPDATE SET quantity = quantity + ?
  `).bind(userId, product_id, quantity, quantity).run();

  if (!success) {
    return errorResponse('Erreur lors de l\'ajout au panier');
  }

  return jsonResponse({ message: 'Produit ajouté au panier' });
}

// === COMMANDES ===
async function createOrder(request, env, userId) {
  const { shipping_address, payment_method } = await request.json();

  // Récupérer les articles du panier
  const { results: cartItems } = await env.DB.prepare(`
    SELECT ci.*, p.price, p.stock
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
  `).bind(userId).all();

  if (cartItems.length === 0) {
    return errorResponse('Panier vide', 400);
  }

  // Vérifier le stock
  for (const item of cartItems) {
    if (item.stock < item.quantity) {
      return errorResponse(`Stock insuffisant pour ${item.name}`, 400);
    }
  }

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Créer la commande
  const { success, meta } = await env.DB.prepare(`
    INSERT INTO orders (user_id, total, shipping_address, payment_method)
    VALUES (?, ?, ?, ?)
  `).bind(userId, total, shipping_address, payment_method).run();

  if (!success) {
    return errorResponse('Erreur lors de la création de la commande');
  }

  const orderId = meta.last_row_id;

  // Ajouter les articles de commande et mettre à jour le stock
  for (const item of cartItems) {
    await env.DB.prepare(`
      INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
      VALUES (?, ?, ?, ?, ?)
    `).bind(orderId, item.product_id, item.quantity, item.price, item.price * item.quantity).run();

    await env.DB.prepare(`
      UPDATE products SET stock = stock - ? WHERE id = ?
    `).bind(item.quantity, item.product_id).run();
  }

  // Vider le panier
  await env.DB.prepare('DELETE FROM cart_items WHERE user_id = ?').bind(userId).run();

  return jsonResponse({ 
    message: 'Commande créée avec succès', 
    order_id: orderId,
    total 
  }, 201);
}

// === UPLOAD D'IMAGES ===
async function uploadImage(request, env) {
  const formData = await request.formData();
  const file = formData.get('image');
  
  if (!file) {
    return errorResponse('Aucun fichier fourni', 400);
  }

  // Générer un nom unique
  const fileName = `${Date.now()}-${file.name}`;
  
  // Upload vers R2
  await env.IMAGES.put(fileName, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  });

  const imageUrl = `https://your-r2-domain.com/${fileName}`;
  
  return jsonResponse({ 
    message: 'Image uploadée avec succès',
    url: imageUrl,
    fileName 
  });
}

// === PAGE D'ACCUEIL ===
function getHomePage() {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Boutique Cloudflare</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6; 
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 2rem;
            text-align: center;
        }
        .hero {
            background: white;
            border-radius: 20px;
            padding: 3rem;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        h1 { 
            font-size: 3rem; 
            margin-bottom: 1rem;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .subtitle {
            font-size: 1.2rem;
            color: #666;
            margin-bottom: 2rem;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }
        .feature {
            background: white;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .feature h3 {
            color: #667eea;
            margin-bottom: 1rem;
        }
        .api-info {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 1.5rem;
            margin-top: 2rem;
            text-align: left;
        }
        .endpoint {
            background: #e9ecef;
            padding: 0.5rem;
            border-radius: 5px;
            font-family: monospace;
            margin: 0.5rem 0;
        }
        .badge {
            display: inline-block;
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: bold;
            margin-right: 0.5rem;
        }
        .get { background: #d4edda; color: #155724; }
        .post { background: #cce5ff; color: #004085; }
        .put { background: #fff3cd; color: #856404; }
        .delete { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="container">
        <div class="hero">
            <h1>🛍️ Boutique Cloudflare</h1>
            <p class="subtitle">E-commerce moderne avec D1, R2 et Workers</p>
            <p>Remplace MongoDB + Cloudinary par l'infrastructure Cloudflare</p>
        </div>

        <div class="features">
            <div class="feature">
                <h3>🗄️ Base de données D1</h3>
                <p>SQLite serverless ultra-rapide remplaçant MongoDB</p>
            </div>
            <div class="feature">
                <h3>📦 Stockage R2</h3>
                <p>Images et fichiers avec CDN global remplaçant Cloudinary</p>
            </div>
            <div class="feature">
                <h3>⚡ Workers</h3>
                <p>API edge computing déployée mondialement</p>
            </div>
        </div>

        <div class="api-info">
            <h3>📡 API Endpoints</h3>
            
            <h4>Produits</h4>
            <div class="endpoint"><span class="badge get">GET</span>/api/products - Liste des produits</div>
            <div class="endpoint"><span class="badge get">GET</span>/api/products/:id - Détail produit</div>
            <div class="endpoint"><span class="badge post">POST</span>/api/products - Créer produit (admin)</div>
            
            <h4>Authentification</h4>
            <div class="endpoint"><span class="badge post">POST</span>/api/auth - Connexion</div>
            <div class="endpoint"><span class="badge post">POST</span>/api/register - Inscription</div>
            
            <h4>Panier</h4>
            <div class="endpoint"><span class="badge get">GET</span>/api/cart - Voir panier</div>
            <div class="endpoint"><span class="badge post">POST</span>/api/cart - Ajouter au panier</div>
            <div class="endpoint"><span class="badge delete">DELETE</span>/api/cart/:id - Supprimer du panier</div>
            
            <h4>Commandes</h4>
            <div class="endpoint"><span class="badge post">POST</span>/api/orders - Créer commande</div>
            <div class="endpoint"><span class="badge get">GET</span>/api/orders - Mes commandes</div>
            
            <h4>Upload</h4>
            <div class="endpoint"><span class="badge post">POST</span>/api/upload - Upload image vers R2</div>
        </div>
    </div>
</body>
</html>
  `;
}