const fs = require('fs');
const https = require('https');

// Configuration
const VERCEL_URL = 'https://ok-git-main-lucas-projects-34f60a70.vercel.app';
const NEW_DATABASE_ID = 'f71d9c4b-ee81-4cc1-a13d-9e83956e9d29';

// Fonction pour faire des requêtes HTTP
const makeRequest = (url, method = 'GET', data = null) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
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
          const result = JSON.parse(responseData);
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

async function importToVercel() {
  try {
    console.log('📦 Chargement des données MongoDB...');
    const mongoData = JSON.parse(fs.readFileSync('/workspace/mongodb-export.json', 'utf8'));
    
    console.log('🎯 Import vers la nouvelle boutique Cloudflare...');
    console.log(`📍 URL: ${VERCEL_URL}`);
    console.log(`🗄️ Database ID: ${NEW_DATABASE_ID}`);
    console.log('');

    // Importer les catégories
    console.log('🏷️ Import des catégories...');
    for (const category of mongoData.categories) {
      try {
        const result = await makeRequest(`${VERCEL_URL}/api/cloudflare/categories`, 'POST', {
          name: category.name,
          description: category.description || '',
          icon: category.icon || '🏷️',
          color: category.color || '#3B82F6'
        });
        
        if (result.status === 201 || result.status === 200) {
          console.log(`  ✅ ${category.name}`);
        } else {
          console.log(`  ❌ ${category.name}: ${result.status} - ${JSON.stringify(result.data)}`);
        }
      } catch (error) {
        console.log(`  ❌ ${category.name}: ${error.message}`);
      }
    }

    // Importer les farms
    console.log('🏭 Import des farms...');
    for (const farm of mongoData.farms) {
      try {
        const result = await makeRequest(`${VERCEL_URL}/api/cloudflare/farms`, 'POST', {
          name: farm.name,
          description: farm.description || '',
          location: farm.location || '',
          contact: farm.contact || ''
        });
        
        if (result.status === 201 || result.status === 200) {
          console.log(`  ✅ ${farm.name}`);
        } else {
          console.log(`  ❌ ${farm.name}: ${result.status} - ${JSON.stringify(result.data)}`);
        }
      } catch (error) {
        console.log(`  ❌ ${farm.name}: ${error.message}`);
      }
    }

    // Importer les produits
    console.log('📦 Import des produits...');
    let productCount = 0;
    for (const product of mongoData.products.slice(0, 10)) { // Limiter à 10 pour test
      try {
        const result = await makeRequest(`${VERCEL_URL}/api/cloudflare/products`, 'POST', {
          name: product.name,
          description: product.description || '',
          price: parseFloat(product.price) || 0,
          prices: product.prices || {},
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
          productCount++;
        } else {
          console.log(`  ❌ ${product.name}: ${result.status} - ${JSON.stringify(result.data)}`);
        }
      } catch (error) {
        console.log(`  ❌ ${product.name}: ${error.message}`);
      }
    }

    // Importer les settings
    if (mongoData.settings) {
      console.log('⚙️ Import des paramètres...');
      try {
        const result = await makeRequest(`${VERCEL_URL}/api/cloudflare/settings`, 'PUT', {
          shopTitle: mongoData.settings.shopTitle || mongoData.settings.shopName,
          backgroundImage: mongoData.settings.backgroundImage,
          backgroundOpacity: mongoData.settings.backgroundOpacity,
          backgroundBlur: mongoData.settings.backgroundBlur,
          titleStyle: mongoData.settings.titleStyle,
          whatsappLink: mongoData.settings.whatsappLink,
          scrollingText: mongoData.settings.scrollingText
        });
        
        if (result.status === 200) {
          console.log('  ✅ Paramètres importés');
        } else {
          console.log(`  ❌ Paramètres: ${result.status} - ${JSON.stringify(result.data)}`);
        }
      } catch (error) {
        console.log(`  ❌ Paramètres: ${error.message}`);
      }
    }

    console.log('');
    console.log('🎉 MIGRATION TERMINÉE !');
    console.log('');
    console.log('📋 Résumé:');
    console.log(`  - ${mongoData.categories.length} catégories`);
    console.log(`  - ${mongoData.farms.length} farms`);
    console.log(`  - ${productCount}/79 produits (test)`);
    console.log(`  - Paramètres: ${mongoData.settings ? 'Oui' : 'Non'}`);
    console.log('');
    console.log('🎯 Vérifiez votre boutique Vercel !');
    
  } catch (error) {
    console.error('❌ Erreur import:', error);
  }
}

importToVercel();