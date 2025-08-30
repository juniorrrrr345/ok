import mongoose from 'mongoose';
import { MongoClient, Db } from 'mongodb';

// URI MongoDB Atlas - Utilise la variable d'environnement ou votre URI
const MONGODB_URI = process.env.MONGODB_URI || 
  'mongodb+srv://idffulloption:Junior30@cluster0.wdopvu5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Types pour le cache
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

interface MongoClientCache {
  client: MongoClient | null;
  db: Db | null;
  promise: Promise<{ client: MongoClient; db: Db }> | null;
}

// Déclaration globale pour le cache
declare global {
  var mongoose: MongooseCache | undefined;
  var mongoClient: MongoClientCache | undefined;
}

// Cache Mongoose
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Cache MongoClient
let clientCached = global.mongoClient;
if (!clientCached) {
  clientCached = global.mongoClient = { client: null, db: null, promise: null };
}

/**
 * Connexion Mongoose (pour les modèles)
 * Utilise un pool de connexions et réutilise la connexion existante
 */
export async function connectDB() {
  console.log('🔗 Tentative de connexion MongoDB (Mongoose)...');

  if (cached.conn) {
    console.log('✅ Réutilisation connexion Mongoose existante');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 5, // Réduit de 10 à 5 pour économiser les connexions
      minPoolSize: 1, // Maintient au moins 1 connexion active
      serverSelectionTimeoutMS: 10000, // Réduit à 10s
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4, // Force IPv4
      // Options pour éviter les fuites de mémoire
      maxIdleTimeMS: 10000, // Ferme les connexions inactives après 10s
    };

    console.log('🔄 Création nouvelle connexion Mongoose...');
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Connexion MongoDB (Mongoose) réussie');
      
      // Gestion des événements de connexion
      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB déconnecté');
        cached.conn = null;
        cached.promise = null;
      });

      mongoose.connection.on('error', (err) => {
        console.error('❌ Erreur MongoDB:', err);
      });

      return mongoose;
    }).catch((error) => {
      console.error('❌ Erreur connexion MongoDB (Mongoose):', error);
      cached.promise = null;
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    console.error('❌ Échec connexion MongoDB (Mongoose):', e);
    throw e;
  }
}

/**
 * Connexion MongoClient (pour les opérations directes)
 * IMPORTANT: Réutilise TOUJOURS la même connexion client
 */
export async function connectToDatabase() {
  console.log('🔗 Tentative de connexion MongoDB (Client)...');

  // Si on a déjà un client et une db, on les réutilise
  if (clientCached.client && clientCached.db) {
    console.log('✅ Réutilisation connexion MongoClient existante');
    return { client: clientCached.client, db: clientCached.db };
  }

  // Si une promesse est en cours, on l'attend
  if (!clientCached.promise) {
    console.log('🔄 Création nouvelle connexion MongoClient...');
    
    clientCached.promise = new Promise(async (resolve, reject) => {
      try {
        const client = new MongoClient(MONGODB_URI, {
          maxPoolSize: 5, // Réduit pour économiser les connexions
          minPoolSize: 1,
          serverSelectionTimeoutMS: 10000,
          connectTimeoutMS: 10000,
          socketTimeoutMS: 45000,
        });

        await client.connect();
        console.log('✅ Connexion MongoDB (Client) réussie');

        const db = client.db('idffull_shop');
        
        // Sauvegarde dans le cache
        clientCached.client = client;
        clientCached.db = db;

        // Gestion de la fermeture propre
        process.on('SIGINT', async () => {
          console.log('🔄 Fermeture connexion MongoDB...');
          await client.close();
          process.exit(0);
        });

        resolve({ client, db });
      } catch (error) {
        console.error('❌ Erreur connexion MongoDB (Client):', error);
        clientCached.promise = null;
        reject(error);
      }
    });
  }

  try {
    const result = await clientCached.promise;
    return result;
  } catch (e) {
    clientCached.promise = null;
    throw e;
  }
}

/**
 * Fonction pour nettoyer les connexions (à utiliser en développement)
 */
export async function disconnectDB() {
  // Fermeture Mongoose
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('✅ Connexion Mongoose fermée');
  }

  // Fermeture MongoClient
  if (clientCached.client) {
    await clientCached.client.close();
    clientCached.client = null;
    clientCached.db = null;
    clientCached.promise = null;
    console.log('✅ Connexion MongoClient fermée');
  }
}

// Export par défaut
export default connectDB;