#!/usr/bin/env node

/**
 * Script pour nettoyer et optimiser les connexions MongoDB
 * Résout le problème de dépassement de limite de connexions
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI non défini dans les variables d\'environnement');
  process.exit(1);
}

async function cleanConnections() {
  try {
    console.log('🔧 NETTOYAGE DES CONNEXIONS MONGODB');
    console.log('='.repeat(50));
    
    // Connexion temporaire pour vérifier l'état
    console.log('📊 Connexion pour diagnostic...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
    });

    const admin = mongoose.connection.db.admin();
    
    // Récupération des stats avant nettoyage
    console.log('\n📈 État AVANT nettoyage:');
    const beforeStatus = await admin.serverStatus();
    if (beforeStatus.connections) {
      console.log(`   • Connexions actives: ${beforeStatus.connections.current}`);
      console.log(`   • Connexions disponibles: ${beforeStatus.connections.available}`);
      const maxConnections = beforeStatus.connections.current + beforeStatus.connections.available;
      const usagePercent = ((beforeStatus.connections.current / maxConnections) * 100).toFixed(1);
      console.log(`   • Utilisation: ${usagePercent}%`);
    }

    // Forcer la fermeture des connexions inactives
    console.log('\n🔄 Nettoyage des connexions inactives...');
    
    // Commande pour tuer les connexions inactives (si admin)
    try {
      const result = await admin.command({
        currentOp: true,
        $all: true
      });
      
      let killedCount = 0;
      if (result.inprog) {
        for (const op of result.inprog) {
          // Tuer les connexions inactives de plus de 30 secondes
          if (op.secs_running > 30 && op.active === false) {
            try {
              await admin.command({ killOp: 1, op: op.opid });
              killedCount++;
            } catch (e) {
              // Ignorer les erreurs de permissions
            }
          }
        }
      }
      
      if (killedCount > 0) {
        console.log(`   ✅ ${killedCount} connexions inactives fermées`);
      } else {
        console.log('   ℹ️ Aucune connexion inactive trouvée');
      }
    } catch (error) {
      console.log('   ⚠️ Permissions insuffisantes pour nettoyer (normal sur M0)');
    }

    // Attendre un peu pour que les changements prennent effet
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Récupération des stats après nettoyage
    console.log('\n📈 État APRÈS nettoyage:');
    const afterStatus = await admin.serverStatus();
    if (afterStatus.connections) {
      console.log(`   • Connexions actives: ${afterStatus.connections.current}`);
      console.log(`   • Connexions disponibles: ${afterStatus.connections.available}`);
      const maxConnections = afterStatus.connections.current + afterStatus.connections.available;
      const usagePercent = ((afterStatus.connections.current / maxConnections) * 100).toFixed(1);
      console.log(`   • Utilisation: ${usagePercent}%`);
      
      const reduction = beforeStatus.connections.current - afterStatus.connections.current;
      if (reduction > 0) {
        console.log(`\n✅ Réduction: ${reduction} connexions libérées`);
      }
    }

    // Recommandations
    console.log('\n💡 RECOMMANDATIONS:');
    console.log('1. Redémarrez votre application Next.js');
    console.log('2. Redémarrez vos bots Telegram');
    console.log('3. Vérifiez que toutes les API utilisent /src/lib/mongodb.ts');
    console.log('4. Surveillez avec: npm run monitor:connections');
    
    // Fermeture propre
    await mongoose.connection.close();
    console.log('\n✅ Script terminé avec succès');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Lancement du nettoyage
cleanConnections();