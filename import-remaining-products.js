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

async function importRemainingProducts() {
  try {
    console.log('📦 Chargement des données MongoDB...');
    const mongoData = JSON.parse(fs.readFileSync('/workspace/mongodb-export.json', 'utf8'));
    
    console.log(`🎯 Import des produits restants (${mongoData.products.length - 20} produits)...`);
    console.log('');

    let successCount = 0;
    let errorCount = 0;

    // Importer les produits restants (à partir du 21ème)
    for (let i = 20; i < mongoData.products.length; i++) {
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
          console.log(`  ✅ ${i + 1}/${mongoData.products.length} - ${product.name}`);
          successCount++;
        } else {
          console.log(`  ❌ ${i + 1}/${mongoData.products.length} - ${product.name}: Status ${result.status}`);
          errorCount++;
        }
        
        // Délai pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.log(`  ❌ ${i + 1}/${mongoData.products.length} - ${product.name}: ${error.message}`);
        errorCount++;
      }
    }

    console.log('');
    console.log('🎉 IMPORT PRODUITS RESTANTS TERMINÉ !');
    console.log('');
    console.log('📊 Résultats:');
    console.log(`  ✅ Succès: ${successCount}`);
    console.log(`  ❌ Erreurs: ${errorCount}`);
    console.log(`  📦 Total produits: ${20 + successCount}/${mongoData.products.length}`);
    console.log('');
    console.log('🎯 Votre boutique a maintenant tous vos produits MongoDB !');
    
  } catch (error) {
    console.error('❌ Erreur import:', error);
  }
}

importRemainingProducts();