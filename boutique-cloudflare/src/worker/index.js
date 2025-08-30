/**
 * Worker Cloudflare principal pour l'API de la boutique
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
      'Content-Type': 'application/json',
    };

    // Gestion des requêtes OPTIONS pour CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Router simple
      if (path === '/api/health') {
        return handleHealth(env);
      } else if (path.startsWith('/api/products')) {
        return await handleProducts(request, env, path);
      } else if (path.startsWith('/api/categories')) {
        return await handleCategories(request, env);
      } else if (path.startsWith('/api/orders')) {
        return await handleOrders(request, env, path);
      } else if (path.startsWith('/api/config')) {
        return await handleConfig(request, env);
      } else if (path.startsWith('/api/upload')) {
        return await handleImageUpload(request, env);
      } else if (path.startsWith('/api/telegram-webhook')) {
        return await handleTelegramWebhook(request, env);
      } else {
        return new Response(
          JSON.stringify({ error: 'Route not found' }),
          { status: 404, headers: corsHeaders }
        );
      }
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error', message: error.message }),
        { status: 500, headers: corsHeaders }
      );
    }
  },
};

// Gestionnaire de santé
function handleHealth(env) {
  return new Response(
    JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: env.ENVIRONMENT || 'production',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

// Gestionnaire des produits
async function handleProducts(request, env, path) {
  const method = request.method;
  const productId = path.split('/')[3];

  if (method === 'GET') {
    if (productId) {
      // Récupérer un produit spécifique
      const product = await env.DB.prepare(
        'SELECT * FROM products WHERE id = ?'
      ).bind(productId).first();
      
      return new Response(JSON.stringify(product || { error: 'Product not found' }), {
        status: product ? 200 : 404,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // Récupérer tous les produits
      const { results } = await env.DB.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
      return new Response(JSON.stringify(results), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } else if (method === 'POST') {
    // Créer un nouveau produit
    const data = await request.json();
    const { name, description, price, category, image_url, stock, featured } = data;
    
    const result = await env.DB.prepare(
      'INSERT INTO products (name, description, price, category, image_url, stock, featured) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(name, description, price, category, image_url, stock || 0, featured || 0).run();
    
    return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } else if (method === 'PUT' && productId) {
    // Mettre à jour un produit
    const data = await request.json();
    const { name, description, price, category, image_url, stock, featured } = data;
    
    await env.DB.prepare(
      'UPDATE products SET name = ?, description = ?, price = ?, category = ?, image_url = ?, stock = ?, featured = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(name, description, price, category, image_url, stock, featured, productId).run();
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } else if (method === 'DELETE' && productId) {
    // Supprimer un produit
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
    const { name, description, image_url, display_order } = data;
    
    const result = await env.DB.prepare(
      'INSERT INTO categories (name, description, image_url, display_order) VALUES (?, ?, ?, ?)'
    ).bind(name, description, image_url, display_order || 0).run();
    
    return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), {
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
      // Récupérer une commande spécifique avec ses articles
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
      // Récupérer toutes les commandes
      const { results } = await env.DB.prepare(
        'SELECT * FROM orders ORDER BY created_at DESC'
      ).all();
      
      return new Response(JSON.stringify(results), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } else if (method === 'POST') {
    // Créer une nouvelle commande
    const data = await request.json();
    const { user_id, user_name, user_phone, items, total_amount, payment_method, shipping_address, notes } = data;
    
    // Insérer la commande
    const orderResult = await env.DB.prepare(
      'INSERT INTO orders (user_id, user_name, user_phone, total_amount, payment_method, shipping_address, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(user_id, user_name, user_phone, total_amount, payment_method, shipping_address, notes).run();
    
    const orderId = orderResult.meta.last_row_id;
    
    // Insérer les articles de la commande
    for (const item of items) {
      await env.DB.prepare(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
      ).bind(orderId, item.product_id, item.quantity, item.price).run();
      
      // Mettre à jour le stock
      await env.DB.prepare(
        'UPDATE products SET stock = stock - ? WHERE id = ?'
      ).bind(item.quantity, item.product_id).run();
    }
    
    return new Response(JSON.stringify({ success: true, order_id: orderId }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } else if (method === 'PUT' && orderId) {
    // Mettre à jour le statut d'une commande
    const data = await request.json();
    const { status } = data;
    
    await env.DB.prepare(
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(status, orderId).run();
    
    return new Response(JSON.stringify({ success: true }), {
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
  if (request.method === 'GET') {
    // Récupérer la configuration depuis KV
    const config = await env.CONFIG.get('shop_config', { type: 'json' });
    
    if (!config) {
      // Configuration par défaut
      const defaultConfig = {
        shop_name: 'Boutique Cloudflare',
        welcome_message: '🛍️ Bienvenue dans notre boutique!',
        currency: 'EUR',
        delivery_fee: 5.00,
        min_order_amount: 20.00,
        social_networks: [
          { name: 'Instagram', url: 'https://instagram.com', emoji: '📷' },
          { name: 'Facebook', url: 'https://facebook.com', emoji: '👍' },
          { name: 'Twitter', url: 'https://twitter.com', emoji: '🐦' },
        ],
      };
      
      await env.CONFIG.put('shop_config', JSON.stringify(defaultConfig));
      return new Response(JSON.stringify(defaultConfig), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify(config), {
      headers: { 'Content-Type': 'application/json' },
    });
  } else if (request.method === 'PUT') {
    // Mettre à jour la configuration
    const data = await request.json();
    await env.CONFIG.put('shop_config', JSON.stringify(data));
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Gestionnaire d'upload d'images
async function handleImageUpload(request, env) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Option 1: Utiliser Cloudflare Images (nécessite un compte avec Images activé)
    if (env.CF_IMAGES_TOKEN && env.CF_IMAGES_ACCOUNT_HASH) {
      const imageFormData = new FormData();
      imageFormData.append('file', file);
      
      const uploadResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/images/v1`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.CF_IMAGES_TOKEN}`,
          },
          body: imageFormData,
        }
      );
      
      const result = await uploadResponse.json();
      
      if (result.success) {
        return new Response(JSON.stringify({
          success: true,
          url: result.result.variants[0],
        }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Option 2: Utiliser R2 (stockage d'objets)
    const arrayBuffer = await file.arrayBuffer();
    const fileName = `${Date.now()}-${file.name}`;
    
    await env.IMAGES.put(fileName, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });
    
    // Générer l'URL publique (nécessite la configuration R2 avec un domaine personnalisé)
    const imageUrl = `https://images.boutique.com/${fileName}`;
    
    return new Response(JSON.stringify({
      success: true,
      url: imageUrl,
      fileName: fileName,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Upload error:', error);
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
    
    // Vérifier le secret du webhook
    const secretHeader = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (secretHeader !== env.TELEGRAM_WEBHOOK_SECRET) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Traiter la mise à jour Telegram
    await processTelegramUpdate(update, env);
    
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

// Traitement des mises à jour Telegram
async function processTelegramUpdate(update, env) {
  if (update.message) {
    const chatId = update.message.chat.id;
    const text = update.message.text;
    const userId = update.message.from.id;
    const firstName = update.message.from.first_name;

    // Enregistrer ou mettre à jour l'utilisateur
    await env.DB.prepare(
      'INSERT OR REPLACE INTO users (telegram_id, username, first_name, last_name, language_code, last_seen) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
    ).bind(
      userId.toString(),
      update.message.from.username || null,
      firstName,
      update.message.from.last_name || null,
      update.message.from.language_code || 'fr'
    ).run();

    // Commandes du bot
    if (text === '/start') {
      const config = await env.CONFIG.get('shop_config', { type: 'json' });
      const welcomeMessage = (config?.welcome_message || '🛍️ Bienvenue {firstname}!').replace('{firstname}', firstName);
      
      await sendTelegramMessage(env, chatId, welcomeMessage, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🛍️ Voir la boutique', web_app: { url: 'https://boutique.example.com' } }],
            [{ text: '📦 Mes commandes', callback_data: 'my_orders' }],
            [{ text: '💬 Support', callback_data: 'support' }],
            [{ text: 'ℹ️ Informations', callback_data: 'info' }],
          ],
        },
      });
    } else if (text === '/help') {
      await sendTelegramMessage(env, chatId, 
        '❓ Aide\n\n' +
        '/start - Menu principal\n' +
        '/products - Voir les produits\n' +
        '/orders - Mes commandes\n' +
        '/help - Aide'
      );
    } else if (text === '/products') {
      const { results: products } = await env.DB.prepare(
        'SELECT * FROM products WHERE stock > 0 LIMIT 10'
      ).all();
      
      let message = '🛍️ Produits disponibles:\n\n';
      for (const product of products) {
        message += `• ${product.name} - ${product.price}€\n`;
      }
      
      await sendTelegramMessage(env, chatId, message);
    }
  } else if (update.callback_query) {
    const callbackData = update.callback_query.data;
    const chatId = update.callback_query.message.chat.id;
    
    if (callbackData === 'my_orders') {
      const userId = update.callback_query.from.id.toString();
      const { results: orders } = await env.DB.prepare(
        'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 5'
      ).bind(userId).all();
      
      let message = '📦 Vos commandes:\n\n';
      if (orders.length === 0) {
        message = 'Vous n\'avez pas encore de commandes.';
      } else {
        for (const order of orders) {
          message += `#${order.id} - ${order.total_amount}€ - ${order.status}\n`;
        }
      }
      
      await sendTelegramMessage(env, chatId, message);
    } else if (callbackData === 'support') {
      await sendTelegramMessage(env, chatId, 
        '💬 Support\n\n' +
        '📧 Email: support@boutique.com\n' +
        '📱 Téléphone: +33 1 23 45 67 89\n' +
        '⏰ Horaires: 9h-18h du lundi au vendredi'
      );
    } else if (callbackData === 'info') {
      const config = await env.CONFIG.get('shop_config', { type: 'json' });
      await sendTelegramMessage(env, chatId, 
        `ℹ️ Informations sur ${config?.shop_name || 'Notre boutique'}\n\n` +
        '🚚 Livraison rapide\n' +
        '✅ Produits de qualité\n' +
        '💳 Paiement sécurisé\n' +
        '🔄 Retours faciles'
      );
    }
    
    // Répondre au callback query
    await answerCallbackQuery(env, update.callback_query.id);
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

// Répondre à un callback query
async function answerCallbackQuery(env, callbackQueryId) {
  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`;
  
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
    }),
  });
}