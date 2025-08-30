#!/usr/bin/env node

/**
 * Script de monitoring des connexions MongoDB
 * Aide à diagnostiquer les problèmes de connexions
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI non défini dans les variables d\'environnement');
  process.exit(1);
}

async function monitorConnections() {
  try {
    console.log('🔍 Connexion à MongoDB pour monitoring...');
    
    // Connexion avec options de monitoring
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 1, // Une seule connexion pour le monitoring
      serverSelectionTimeoutMS: 5000,
    });

    console.log('✅ Connecté à MongoDB');
    console.log('📊 Monitoring des connexions...\n');

    // Récupération des statistiques
    const admin = mongoose.connection.db.admin();
    
    // Affichage des informations de connexion
    setInterval(async () => {
      try {
        // Statistiques serveur
        const serverStatus = await admin.serverStatus();
        const connections = serverStatus.connections;
        
        console.clear();
        console.log('='.repeat(50));
        console.log('📊 MONITORING CONNEXIONS MONGODB');
        console.log('='.repeat(50));
        console.log(`📅 Date: ${new Date().toLocaleString('fr-FR')}`);
        console.log(`🔗 URI: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
        console.log('-'.repeat(50));
        
        if (connections) {
          console.log('📈 Statistiques de connexions:');
          console.log(`   • Connexions actuelles: ${connections.current}`);
          console.log(`   • Connexions disponibles: ${connections.available}`);
          console.log(`   • Total créées: ${connections.totalCreated}`);
          
          // Calcul du pourcentage d'utilisation
          const maxConnections = connections.current + connections.available;
          const usagePercent = ((connections.current / maxConnections) * 100).toFixed(1);
          
          console.log(`   • Utilisation: ${usagePercent}%`);
          
          // Alertes
          if (usagePercent > 80) {
            console.log('\n⚠️  ALERTE: Utilisation élevée des connexions!');
          }
          if (connections.current > 400) {
            console.log('🚨 ALERTE CRITIQUE: Proche de la limite M0 (500 connexions)!');
          }
        }
        
        // État de la connexion locale
        console.log('\n📡 État connexion locale:');
        console.log(`   • ReadyState: ${mongoose.connection.readyState}`);
        console.log(`   • État: ${getConnectionState(mongoose.connection.readyState)}`);
        
        console.log('\n💡 Appuyez sur Ctrl+C pour quitter');
        
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des stats:', error.message);
      }
    }, 5000); // Actualisation toutes les 5 secondes

  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    process.exit(1);
  }
}

function getConnectionState(state) {
  switch(state) {
    case 0: return 'Déconnecté';
    case 1: return 'Connecté';
    case 2: return 'En cours de connexion';
    case 3: return 'En cours de déconnexion';
    default: return 'Inconnu';
  }
}

// Gestion de la fermeture propre
process.on('SIGINT', async () => {
  console.log('\n\n🔄 Fermeture du monitoring...');
  await mongoose.connection.close();
  console.log('✅ Connexion fermée proprement');
  process.exit(0);
});

// Lancement du monitoring
monitorConnections();