const fs = require('fs');
const https = require('https');

const VERCEL_URL = 'ok-git-main-lucas-projects-34f60a70.vercel.app';

// Fonction pour faire des requêtes HTTPS
const makeRequest = (path, method = 'GET', data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: VERCEL_URL,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const result = responseData ? JSON.parse(responseData) : {};
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
};

async function importData() {
  try {
    console.log('📦 Chargement des données MongoDB...');
    const mongoData = JSON.parse(fs.readFileSync('/workspace/mongodb-export.json', 'utf8'));
    
    console.log('🎯 Import vers la boutique actuelle...');
    console.log(`📍 URL: https://${VERCEL_URL}`);
    console.log('');

    let successCount = 0;
    let errorCount = 0;

    // Importer les catégories
    console.log('🏷️ Import des catégories...');
    for (const category of mongoData.categories) {
      try {
        const result = await makeRequest('/api/cloudflare/categories', 'POST', {
          name: category.name,
          description: category.description || '',
          icon: category.emoji || category.icon || '🏷️',
          color: category.color || '#3B82F6'
        });
        
        if (result.status === 201 || result.status === 200) {
          console.log(`  ✅ ${category.name}`);
          successCount++;
        } else {
          console.log(`  ❌ ${category.name}: Status ${result.status}`);
          errorCount++;
        }
        
        // Délai pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.log(`  ❌ ${category.name}: ${error.message}`);
        errorCount++;
      }
    }

    // Importer les farms
    console.log('🏭 Import des farms...');
    for (const farm of mongoData.farms) {
      try {
        const result = await makeRequest('/api/cloudflare/farms', 'POST', {
          name: farm.name,
          description: farm.description || '',
          location: farm.location || '',
          contact: farm.contact || ''
        });
        
        if (result.status === 201 || result.status === 200) {
          console.log(`  ✅ ${farm.name}`);
          successCount++;
        } else {
          console.log(`  ❌ ${farm.name}: Status ${result.status}`);
          errorCount++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.log(`  ❌ ${farm.name}: ${error.message}`);
        errorCount++;
      }
    }

    // Importer les produits (par petits lots)
    console.log('📦 Import des produits (premiers 20)...');
    for (let i = 0; i < Math.min(20, mongoData.products.length); i++) {
      const product = mongoData.products[i];
      try {
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

        const result = await makeRequest('/api/cloudflare/products', 'POST', {
          name: product.name,
          description: product.description || '',
          price: parseFloat(product.price) || 0,
          prices: prices,
          category: product.category,
          farm: product.farm,
          image_url: product.image || '',
          video_url: product.video || '',
          images: product.images || [],
          stock: parseInt(product.stock) || 0,
          is_available: product.isAvailable !== false,
          features: product.features || [],
          tags: product.tags || []
        });
        
        if (result.status === 201 || result.status === 200) {
          console.log(`  ✅ ${product.name}`);
          successCount++;
        } else {
          console.log(`  ❌ ${product.name}: Status ${result.status}`);
          errorCount++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 200)); // Plus de délai pour les produits
      } catch (error) {
        console.log(`  ❌ ${product.name}: ${error.message}`);
        errorCount++;
      }
    }

    // Importer les settings
    if (mongoData.settings) {
      console.log('⚙️ Import des paramètres...');
      try {
        const result = await makeRequest('/api/cloudflare/settings', 'PUT', {
          shopTitle: mongoData.settings.shopTitle || mongoData.settings.shopName || 'Ma Boutique',
          backgroundImage: mongoData.settings.backgroundImage || '',
          backgroundOpacity: mongoData.settings.backgroundOpacity || 20,
          backgroundBlur: mongoData.settings.backgroundBlur || 5,
          titleStyle: mongoData.settings.titleStyle || 'glow',
          whatsappLink: mongoData.settings.whatsappLink || '',
          scrollingText: mongoData.settings.scrollingText || ''
        });
        
        if (result.status === 200) {
          console.log('  ✅ Paramètres importés');
          successCount++;
        } else {
          console.log(`  ❌ Paramètres: Status ${result.status}`);
          errorCount++;
        }
      } catch (error) {
        console.log(`  ❌ Paramètres: ${error.message}`);
        errorCount++;
      }
    }

    console.log('');
    console.log('🎉 IMPORT TERMINÉ !');
    console.log('');
    console.log('📊 Résultats:');
    console.log(`  ✅ Succès: ${successCount}`);
    console.log(`  ❌ Erreurs: ${errorCount}`);
    console.log('');
    console.log('🎯 Vérifiez votre boutique: https://ok-git-main-lucas-projects-34f60a70.vercel.app/');
    console.log('🛠️ Panel admin: https://ok-git-main-lucas-projects-34f60a70.vercel.app/admin');
    
  } catch (error) {
    console.error('❌ Erreur import:', error);
  }
}

importData();