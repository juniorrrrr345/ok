import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

interface MongoClientCache {
  client: MongoClient | null;
  db: any | null;
  promise: Promise<{ client: MongoClient; db: any }> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
  var mongoClient: MongoClientCache | undefined;
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

let clientCached = global.mongoClient;
if (!clientCached) {
  clientCached = global.mongoClient = { client: null, db: null, promise: null };
}

async function connectDB() {
  // Configuration MongoDB - URI depuis les variables d'environnement
  const MONGODB_URI = process.env.MONGODB_URI || 
    'mongodb+srv://idffulloption:Junior30@cluster0.wdopvu5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

  console.log('🔗 Connexion MongoDB avec URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

  if (!MONGODB_URI) {
    throw new Error('⚠️ Impossible de se connecter à MongoDB');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 5, // Réduit pour économiser les connexions
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Fonction pour l'API (MongoDB client direct) - OPTIMISÉE pour réutiliser la connexion
export async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI || 
    'mongodb+srv://idffulloption:Junior30@cluster0.wdopvu5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

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

export default connectDB;