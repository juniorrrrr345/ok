/**
 * API Worker Cloudflare pour remplacer les routes Next.js API
 * Ce worker gère toutes les routes API de la boutique
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Headers CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Gestion des requêtes OPTIONS pour CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Router API
      let response;
      
      if (path === '/api/products' || path.startsWith('/api/products/')) {
        response = await handleProducts(request, env, path);
      } else if (path === '/api/categories') {
        response = await handleCategories(request, env);
      } else if (path === '/api/orders' || path.startsWith('/api/orders/')) {
        response = await handleOrders(request, env, path);
      } else if (path === '/api/config') {
        response = await handleConfig(request, env);
      } else if (path === '/api/upload-r2') {
        response = await handleR2Upload(request, env);
      } else if (path === '/api/telegram-webhook') {
        response = await handleTelegramWebhook(request, env);
      } else if (path === '/api/admin/login') {
        response = await handleAdminLogin(request, env);
      } else if (path === '/api/admin/products') {
        response = await handleAdminProducts(request, env);
      } else {
        response = new Response(
          JSON.stringify({ error: 'Route not found' }),
          { status: 404 }
        );
      }

      // Ajouter les headers CORS à la réponse
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      return response;
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error', message: error.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  },
};

// Gestionnaire des produits
async function handleProducts(request, env, path) {
  const method = request.method;
  const productId = path.split('/')[3];

  if (method === 'GET') {
    if (productId) {
      const product = await env.DB.prepare(
        'SELECT * FROM products WHERE id = ?'
      ).bind(productId).first();
      
      return new Response(JSON.stringify(product || { error: 'Product not found' }), {
        status: product ? 200 : 404,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      const { results } = await env.DB.prepare(
        'SELECT * FROM products ORDER BY created_at DESC'
      ).all();
      
      return new Response(JSON.stringify(results), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } else if (method === 'POST') {
    const data = await request.json();
    const { name, description, price, category, image_url, stock, featured } = data;
    
    const result = await env.DB.prepare(
      'INSERT INTO products (name, description, price, category, image_url, stock, featured) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(name, description, price, category, image_url, stock || 0, featured || 0).run();
    
    return new Response(JSON.stringify({ 
      success: true, 
      id: result.meta.last_row_id 
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } else if (method === 'PUT' && productId) {
    const data = await request.json();
    
    await env.DB.prepare(
      'UPDATE products SET name = ?, description = ?, price = ?, category = ?, image_url = ?, stock = ?, featured = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(
      data.name, 
      data.description, 
      data.price, 
      data.category, 
      data.image_url, 
      data.stock, 
      data.featured, 
      productId
    ).run();
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } else if (method === 'DELETE' && productId) {
    await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(productId).run();
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Gestionnaire des catégories
async function handleCategories(request, env) {
  if (request.method === 'GET') {
    const { results } = await env.DB.prepare(
      'SELECT * FROM categories ORDER BY display_order ASC'
    ).all();
    
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  } else if (request.method === 'POST') {
    const data = await request.json();
    
    const result = await env.DB.prepare(
      'INSERT INTO categories (name, description, image_url, display_order) VALUES (?, ?, ?, ?)'
    ).bind(
      data.name, 
      data.description, 
      data.image_url, 
      data.display_order || 0
    ).run();
    
    return new Response(JSON.stringify({ 
      success: true, 
      id: result.meta.last_row_id 
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Gestionnaire des commandes
async function handleOrders(request, env, path) {
  const method = request.method;
  const orderId = path.split('/')[3];

  if (method === 'GET') {
    if (orderId) {
      const order = await env.DB.prepare(
        'SELECT * FROM orders WHERE id = ?'
      ).bind(orderId).first();
      
      if (order) {
        const { results: items } = await env.DB.prepare(
          'SELECT oi.*, p.name as product_name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?'
        ).bind(orderId).all();
        
        order.items = items;
      }
      
      return new Response(JSON.stringify(order || { error: 'Order not found' }), {
        status: order ? 200 : 404,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      const { results } = await env.DB.prepare(
        'SELECT * FROM orders ORDER BY created_at DESC LIMIT 50'
      ).all();
      
      return new Response(JSON.stringify(results), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } else if (method === 'POST') {
    const data = await request.json();
    
    // Créer la commande
    const orderResult = await env.DB.prepare(
      'INSERT INTO orders (user_id, user_name, user_phone, total_amount, payment_method, shipping_address, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      data.user_id,
      data.user_name,
      data.user_phone,
      data.total_amount,
      data.payment_method,
      data.shipping_address,
      data.notes
    ).run();
    
    const orderId = orderResult.meta.last_row_id;
    
    // Ajouter les articles
    if (data.items && data.items.length > 0) {
      for (const item of data.items) {
        await env.DB.prepare(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
        ).bind(orderId, item.product_id, item.quantity, item.price).run();
        
        // Mettre à jour le stock
        await env.DB.prepare(
          'UPDATE products SET stock = stock - ? WHERE id = ?'
        ).bind(item.quantity, item.product_id).run();
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      order_id: orderId 
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Gestionnaire de configuration
async function handleConfig(request, env) {
  const CloudflareConfig = require('../../config-cloudflare.js');
  const config = new CloudflareConfig(env);

  if (request.method === 'GET') {
    const data = await config.loadConfig();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } else if (request.method === 'PUT') {
    const data = await request.json();
    const success = await config.saveConfig(data);
    
    return new Response(JSON.stringify({ success }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Gestionnaire d'upload vers R2
async function handleR2Upload(request, env) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const fileName = formData.get('fileName') || `${Date.now()}-image`;
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Upload vers R2
    const arrayBuffer = await file.arrayBuffer();
    await env.IMAGES.put(fileName, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });
    
    // Générer l'URL publique
    const url = `${env.R2_PUBLIC_URL || 'https://images.boutique.com'}/${fileName}`;
    
    return new Response(JSON.stringify({
      success: true,
      url: url,
      fileName: fileName,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('R2 upload error:', error);
    return new Response(JSON.stringify({
      error: 'Upload failed',
      message: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Gestionnaire du webhook Telegram
async function handleTelegramWebhook(request, env) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const update = await request.json();
    
    // Vérifier le secret
    const secretHeader = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (secretHeader !== env.TELEGRAM_WEBHOOK_SECRET) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Traiter la mise à jour
    await processTelegramUpdate(update, env);
    
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

// Traitement des mises à jour Telegram
async function processTelegramUpdate(update, env) {
  const CloudflareConfig = require('../../config-cloudflare.js');
  const config = new CloudflareConfig(env);
  
  if (update.message) {
    const chatId = update.message.chat.id;
    const text = update.message.text;
    const userId = update.message.from.id;
    const firstName = update.message.from.first_name;

    // Enregistrer l'utilisateur
    await env.DB.prepare(
      'INSERT OR REPLACE INTO users (telegram_id, username, first_name, last_name, language_code, last_seen) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
    ).bind(
      userId.toString(),
      update.message.from.username || null,
      firstName,
      update.message.from.last_name || null,
      update.message.from.language_code || 'fr'
    ).run();

    if (text === '/start') {
      const configData = await config.loadConfig();
      const welcomeMessage = configData.welcomeMessage.replace('{firstname}', firstName);
      
      await sendTelegramMessage(env, chatId, welcomeMessage, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🛍️ Boutique', web_app: { url: env.NEXT_PUBLIC_APP_URL || 'https://boutique.com' } }],
            [{ text: '📦 Mes commandes', callback_data: 'my_orders' }],
            [{ text: 'ℹ️ Info', callback_data: 'info' }],
          ],
        },
      });
    }
  }
}

// Envoyer un message Telegram
async function sendTelegramMessage(env, chatId, text, options = {}) {
  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      ...options,
    }),
  });
}

// Gestionnaire de connexion admin
async function handleAdminLogin(request, env) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { username, password } = await request.json();
  
  // Vérifier les credentials (stockés dans les variables d'environnement)
  if (username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD) {
    // Générer un token JWT simple
    const token = btoa(JSON.stringify({
      username,
      exp: Date.now() + 86400000 // 24 heures
    }));
    
    return new Response(JSON.stringify({ 
      success: true,
      token 
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  return new Response(JSON.stringify({ 
    error: 'Invalid credentials' 
  }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Gestionnaire des produits admin
async function handleAdminProducts(request, env) {
  // Vérifier l'authentification
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Déléguer au gestionnaire de produits normal
  return handleProducts(request, env, '/api/products');
}