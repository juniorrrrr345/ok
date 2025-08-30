const { MongoClient } = require('mongodb');
const https = require('https');

// Configuration MongoDB
const MONGODB_URI = 'mongodb+srv://calitkekj:mBPviTkb8X2Wqasb@calitek.vuwxigi.mongodb.net/?retryWrites=true&w=majority&appName=calitek';

// Configuration Cloudflare D1
const CLOUDFLARE_ACCOUNT_ID = '7979421604bd07b3bd34d3ed96222512';
const CLOUDFLARE_API_TOKEN = 'ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW';
const CLOUDFLARE_DATABASE_ID = 'f71d9c4b-ee81-4cc1-a13d-9e83956e9d29'; // Nouvelle base propre

async function migrateData() {
  console.log('🔄 Début de la migration MongoDB → Cloudflare D1...');
  
  let client;
  try {
    // Connexion à MongoDB
    console.log('📡 Connexion à MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    
    console.log('✅ Connecté à MongoDB');

    // Récupérer les données
    console.log('📦 Récupération des données...');
    
    const [products, categories, farms, settings, socialLinks, pages] = await Promise.all([
      db.collection('products').find({}).toArray(),
      db.collection('categories').find({}).toArray(),
      db.collection('farms').find({}).toArray(),
      db.collection('settings').findOne({}),
      db.collection('socialLinks').find({}).toArray(),
      db.collection('pages').find({}).toArray()
    ]);

    console.log('📊 Données récupérées:');
    console.log(`  - Produits: ${products.length}`);
    console.log(`  - Catégories: ${categories.length}`);
    console.log(`  - Farms: ${farms.length}`);
    console.log(`  - Settings: ${settings ? 'Oui' : 'Non'}`);
    console.log(`  - Réseaux sociaux: ${socialLinks.length}`);
    console.log(`  - Pages: ${pages.length}`);

    // Fonction pour exécuter des requêtes D1 avec https natif
    const executeD1Query = async (sql, params = []) => {
      return new Promise((resolve, reject) => {
        const postData = JSON.stringify({ sql, params });
        
        const options = {
          hostname: 'api.cloudflare.com',
          path: `/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${CLOUDFLARE_DATABASE_ID}/query`,
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              const result = JSON.parse(data);
              if (!result.success) {
                reject(new Error(`D1 Query failed: ${JSON.stringify(result.errors)}`));
              } else {
                resolve(result.result[0]);
              }
            } catch (error) {
              reject(error);
            }
          });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
      });
    };

    // Migrer les catégories
    console.log('🏷️ Migration des catégories...');
    for (const category of categories) {
      try {
        await executeD1Query(
          'INSERT INTO categories (name, description, icon, color) VALUES (?, ?, ?, ?)',
          [
            category.name || 'Sans nom',
            category.description || '',
            category.icon || '🏷️',
            category.color || '#3B82F6'
          ]
        );
        console.log(`  ✅ ${category.name}`);
      } catch (error) {
        console.log(`  ❌ ${category.name}: ${error.message}`);
      }
    }

    // Migrer les farms
    console.log('🏭 Migration des farms...');
    for (const farm of farms) {
      try {
        await executeD1Query(
          'INSERT INTO farms (name, description, location, contact) VALUES (?, ?, ?, ?)',
          [
            farm.name || 'Sans nom',
            farm.description || '',
            farm.location || '',
            farm.contact || ''
          ]
        );
        console.log(`  ✅ ${farm.name}`);
      } catch (error) {
        console.log(`  ❌ ${farm.name}: ${error.message}`);
      }
    }

    // Récupérer les IDs des catégories et farms créées
    const d1Categories = await executeD1Query('SELECT * FROM categories');
    const d1Farms = await executeD1Query('SELECT * FROM farms');

    // Créer des maps pour le mapping
    const categoryMap = new Map();
    d1Categories.results.forEach(cat => {
      categoryMap.set(cat.name, cat.id);
    });

    const farmMap = new Map();
    d1Farms.results.forEach(farm => {
      farmMap.set(farm.name, farm.id);
    });

    // Migrer les produits
    console.log('📦 Migration des produits...');
    for (const product of products) {
      try {
        // Mapper les catégories et farms
        const category_id = categoryMap.get(product.category) || null;
        const farm_id = farmMap.get(product.farm) || null;

        // Gérer les prix
        let prices = {};
        if (product.prices && typeof product.prices === 'object') {
          prices = product.prices;
        } else if (product.price) {
          const basePrice = parseFloat(product.price);
          prices = {
            "5g": basePrice,
            "10g": Math.round(basePrice * 1.8 * 100) / 100,
            "25g": Math.round(basePrice * 4 * 100) / 100,
            "50g": Math.round(basePrice * 7 * 100) / 100,
            "100g": Math.round(basePrice * 12 * 100) / 100,
            "200g": Math.round(basePrice * 20 * 100) / 100,
          };
        }

        await executeD1Query(
          'INSERT INTO products (name, description, price, prices, category_id, farm_id, image_url, video_url, images, stock, is_available, features, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            product.name || 'Sans nom',
            product.description || '',
            parseFloat(product.price) || 0,
            JSON.stringify(prices),
            category_id,
            farm_id,
            product.image || '',
            product.video || '',
            JSON.stringify(product.images || []),
            parseInt(product.stock) || 0,
            product.isAvailable !== false,
            JSON.stringify(product.features || []),
            JSON.stringify(product.tags || [])
          ]
        );
        console.log(`  ✅ ${product.name}`);
      } catch (error) {
        console.log(`  ❌ ${product.name}: ${error.message}`);
      }
    }

    // Migrer les settings
    if (settings) {
      console.log('⚙️ Migration des paramètres...');
      try {
        await executeD1Query(
          'UPDATE settings SET shop_name = ?, background_image = ?, background_opacity = ?, background_blur = ?, theme_color = ?, contact_info = ?, shop_description = ? WHERE id = 1',
          [
            settings.shopTitle || settings.shopName || 'Ma Boutique',
            settings.backgroundImage || '',
            parseInt(settings.backgroundOpacity) || 20,
            parseInt(settings.backgroundBlur) || 5,
            settings.themeColor || settings.titleStyle || '#000000',
            settings.whatsappLink || settings.contactInfo || '',
            settings.shopDescription || settings.shopSubtitle || ''
          ]
        );
        console.log('  ✅ Paramètres migrés');
      } catch (error) {
        console.log(`  ❌ Paramètres: ${error.message}`);
      }
    }

    // Migrer les réseaux sociaux
    console.log('🌐 Migration des réseaux sociaux...');
    for (const social of socialLinks) {
      try {
        await executeD1Query(
          'INSERT INTO social_links (name, url, icon, is_active, sort_order) VALUES (?, ?, ?, ?, ?)',
          [
            social.name || 'Sans nom',
            social.url || '#',
            social.icon || '🔗',
            social.isActive !== false,
            social.order || social.sortOrder || 0
          ]
        );
        console.log(`  ✅ ${social.name}`);
      } catch (error) {
        console.log(`  ❌ ${social.name}: ${error.message}`);
      }
    }

    // Migrer les pages
    console.log('📄 Migration des pages...');
    for (const page of pages) {
      try {
        await executeD1Query(
          'INSERT OR REPLACE INTO pages (slug, title, content, is_active) VALUES (?, ?, ?, ?)',
          [
            page.slug || page.name?.toLowerCase() || 'page',
            page.title || page.name || 'Page',
            page.content || '',
            page.isActive !== false
          ]
        );
        console.log(`  ✅ ${page.title || page.name}`);
      } catch (error) {
        console.log(`  ❌ ${page.title || page.name}: ${error.message}`);
      }
    }

    console.log('');
    console.log('🎉 MIGRATION TERMINÉE !');
    console.log('');
    console.log('📋 Résumé:');
    console.log(`  - ${categories.length} catégories migrées`);
    console.log(`  - ${farms.length} farms migrées`);
    console.log(`  - ${products.length} produits migrés`);
    console.log(`  - ${socialLinks.length} réseaux sociaux migrés`);
    console.log(`  - ${pages.length} pages migrées`);
    console.log(`  - Paramètres migrés: ${settings ? 'Oui' : 'Non'}`);
    console.log('');
    console.log('🎯 Votre nouvelle base Cloudflare D1 est prête !');
    console.log(`📍 Database ID: ${CLOUDFLARE_DATABASE_ID}`);

  } catch (error) {
    console.error('❌ Erreur migration:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('📡 Connexion MongoDB fermée');
    }
  }
}

// Exécuter la migration
if (require.main === module) {
  migrateData().catch(console.error);
}

module.exports = { migrateData };