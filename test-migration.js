const { MongoClient } = require('mongodb');
const https = require('https');

const MONGODB_URI = 'mongodb+srv://calitkekj:mBPviTkb8X2Wqasb@calitek.vuwxigi.mongodb.net/?retryWrites=true&w=majority&appName=calitek';
const CLOUDFLARE_ACCOUNT_ID = '7979421604bd07b3bd34d3ed96222512';
const CLOUDFLARE_API_TOKEN = 'ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW';
const CLOUDFLARE_DATABASE_ID = 'f71d9c4b-ee81-4cc1-a13d-9e83956e9d29';

async function testMigration() {
  let client;
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    
    // Récupérer juste les catégories pour tester
    const categories = await db.collection('categories').find({}).limit(3).toArray();
    console.log('📊 Catégories récupérées:', categories.map(c => c.name));
    
    // Exporter vers un fichier JSON pour vous
    const fs = require('fs');
    
    const allData = {
      categories: await db.collection('categories').find({}).toArray(),
      farms: await db.collection('farms').find({}).toArray(),
      products: await db.collection('products').find({}).toArray(),
      settings: await db.collection('settings').findOne({}),
      socialLinks: await db.collection('socialLinks').find({}).toArray(),
      pages: await db.collection('pages').find({}).toArray()
    };
    
    fs.writeFileSync('/workspace/mongodb-export.json', JSON.stringify(allData, null, 2));
    console.log('✅ Données exportées vers mongodb-export.json');
    console.log('📊 Résumé:');
    console.log(`  - Produits: ${allData.products.length}`);
    console.log(`  - Catégories: ${allData.categories.length}`);
    console.log(`  - Farms: ${allData.farms.length}`);
    console.log(`  - Settings: ${allData.settings ? 'Oui' : 'Non'}`);
    console.log(`  - Réseaux sociaux: ${allData.socialLinks.length}`);
    console.log(`  - Pages: ${allData.pages.length}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

testMigration();