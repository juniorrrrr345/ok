require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs-extra');
const { loadConfig, saveConfig, getImagePath } = require('./config');
const { getMainKeyboard, getAdminKeyboard, getSocialManageKeyboard, getSocialLayoutKeyboard, getConfirmKeyboard } = require('./keyboards');
const { User } = require('./models');

// Configuration Express pour production
const app = express();
const PORT = process.env.PORT || 3000;

// Vérifier les variables d'environnement critiques
if (!process.env.BOT_TOKEN) {
    console.error('❌ BOT_TOKEN n\'est pas défini');
    process.exit(1);
}

if (!process.env.ADMIN_ID) {
    console.error('❌ ADMIN_ID n\'est pas défini');
    process.exit(1);
}

// Configuration du webhook avec fallback intelligent
const WEBHOOK_URL = process.env.WEBHOOK_URL || 
                    process.env.RENDER_EXTERNAL_URL || 
                    process.env.RAILWAY_PUBLIC_DOMAIN ||
                    process.env.VERCEL_URL ||
                    'https://your-app.onrender.com';

const WEBHOOK_PATH = `/bot${process.env.BOT_TOKEN}`;
const ADMIN_ID = parseInt(process.env.ADMIN_ID);

// Configuration du bot avec options optimisées pour webhook
const bot = new TelegramBot(process.env.BOT_TOKEN, { 
    webHook: {
        port: PORT,
        autoOpen: false
    }
});

// Middleware Express
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging pour debug
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Route principale - Dashboard
app.get('/', (req, res) => {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Bot Telegram - Dashboard</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                }
                .container {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
                    text-align: center;
                    max-width: 500px;
                }
                h1 { margin: 0 0 20px 0; }
                .status { 
                    background: #10b981;
                    display: inline-block;
                    padding: 8px 16px;
                    border-radius: 20px;
                    margin: 10px 0;
                }
                .stats {
                    margin-top: 30px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }
                .stat {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 15px;
                    border-radius: 10px;
                }
                .value { font-size: 24px; font-weight: bold; }
                .label { opacity: 0.8; margin-top: 5px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🤖 Bot Telegram</h1>
                <div class="status">✅ En ligne</div>
                <div class="stats">
                    <div class="stat">
                        <div class="value">${hours}h ${minutes}m ${seconds}s</div>
                        <div class="label">Temps de fonctionnement</div>
                    </div>
                    <div class="stat">
                        <div class="value">${new Date().toLocaleTimeString()}</div>
                        <div class="label">Heure serveur</div>
                    </div>
                    <div class="stat">
                        <div class="value">${process.memoryUsage().heapUsed / 1024 / 1024 | 0} MB</div>
                        <div class="label">Mémoire utilisée</div>
                    </div>
                    <div class="stat">
                        <div class="value">v${process.version}</div>
                        <div class="label">Node.js</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
});

// Route de santé pour monitoring (UptimeRobot, etc.)
app.get('/health', async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
        const botInfo = await bot.getMe().catch(() => null);
        
        res.json({ 
            status: 'healthy',
            bot: botInfo ? 'active' : 'checking',
            database: dbStatus,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            webhook: WEBHOOK_URL + WEBHOOK_PATH
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Route pour le webhook Telegram
app.post(WEBHOOK_PATH, (req, res) => {
    try {
        bot.processUpdate(req.body);
        res.sendStatus(200);
    } catch (error) {
        console.error('Erreur traitement webhook:', error);
        res.sendStatus(500);
    }
});

// Route pour vérifier le webhook
app.get('/webhook-info', async (req, res) => {
    try {
        const info = await bot.getWebHookInfo();
        res.json(info);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// État des utilisateurs et configuration
const userStates = {};
const activeMessages = {};
const users = new Set();
const admins = new Set([parseInt(process.env.ADMIN_ID)]);
let config = {};
const botStartTime = new Date();

// Système de keep-alive automatique
let keepAliveInterval;

function startKeepAlive() {
    // Si on est en production, activer le keep-alive
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_KEEPALIVE === 'true') {
        console.log('🔄 Activation du système keep-alive');
        
        // Ping toutes les 5 minutes
        keepAliveInterval = setInterval(async () => {
            try {
                const url = `${WEBHOOK_URL}/health`;
                const response = await axios.get(url, { timeout: 5000 });
                console.log(`✅ Keep-alive ping: ${response.data.status}`);
            } catch (error) {
                console.error('❌ Erreur keep-alive:', error.message);
            }
        }, 5 * 60 * 1000); // 5 minutes
    }
}

// Connexion MongoDB avec retry automatique
async function connectDB() {
    if (!process.env.MONGODB_URI) {
        console.log('⚠️ MONGODB_URI non défini, mode fichier local activé');
        return false;
    }
    
    const maxRetries = 5;
    let retries = 0;
    
    while (retries < maxRetries) {
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            
            console.log('✅ Connecté à MongoDB');
            
            // Gérer les déconnexions
            mongoose.connection.on('disconnected', () => {
                console.log('⚠️ MongoDB déconnecté, tentative de reconnexion...');
                setTimeout(connectDB, 5000);
            });
            
            return true;
        } catch (error) {
            retries++;
            console.error(`❌ Erreur MongoDB (tentative ${retries}/${maxRetries}):`, error.message);
            
            if (retries < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
    
    console.log('⚠️ Impossible de se connecter à MongoDB, mode dégradé activé');
    return false;
}

// Initialisation du bot
async function initializeBot() {
    try {
        // Connexion DB
        await connectDB();
        
        // Charger la configuration
        config = await loadConfig();
        console.log('✅ Configuration chargée');
        
        // Supprimer l'ancien webhook s'il existe
        await bot.deleteWebHook();
        
        // Configurer le nouveau webhook
        const webhookUrl = `${WEBHOOK_URL}${WEBHOOK_PATH}`;
        const webhookOptions = {
            max_connections: 100,
            allowed_updates: ['message', 'callback_query', 'inline_query', 'my_chat_member']
        };
        
        await bot.setWebHook(webhookUrl, webhookOptions);
        console.log(`🔗 Webhook configuré: ${webhookUrl}`);
        
        // Vérifier le webhook
        const webhookInfo = await bot.getWebHookInfo();
        console.log('📊 Info webhook:', {
            url: webhookInfo.url,
            pending: webhookInfo.pending_update_count,
            last_error: webhookInfo.last_error_message
        });
        
        // Démarrer le keep-alive
        startKeepAlive();
        
    } catch (error) {
        console.error('❌ Erreur initialisation:', error);
        // Réessayer après 10 secondes
        setTimeout(initializeBot, 10000);
    }
}

// Fonction helper pour supprimer les messages
async function deleteActiveMessage(chatId) {
    if (activeMessages[chatId]) {
        try {
            await bot.deleteMessage(chatId, activeMessages[chatId]);
        } catch (error) {
            // Ignorer si le message est déjà supprimé
        }
        delete activeMessages[chatId];
    }
}

// Fonction pour envoyer un nouveau message
async function sendNewMessage(chatId, text, options = {}) {
    await deleteActiveMessage(chatId);
    const message = await bot.sendMessage(chatId, text, options);
    activeMessages[chatId] = message.message_id;
    return message;
}

// Commande /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    try {
        // Supprimer le message de commande
        await bot.deleteMessage(chatId, msg.message_id);
    } catch (error) {}
    
    // Sauvegarder l'utilisateur si MongoDB est connecté
    if (mongoose.connection.readyState === 1) {
        try {
            await User.findOneAndUpdate(
                { userId },
                {
                    userId,
                    username: msg.from.username,
                    firstName: msg.from.first_name,
                    lastName: msg.from.last_name,
                    lastSeen: new Date()
                },
                { upsert: true, new: true }
            );
        } catch (error) {
            console.error('Erreur sauvegarde utilisateur:', error);
        }
    }
    
    // Message de bienvenue personnalisé
    let welcomeText = config.welcomeMessage || '👋 Bienvenue sur notre bot!';
    welcomeText = welcomeText
        .replace('{firstname}', msg.from.first_name || '')
        .replace('{lastname}', msg.from.last_name || '')
        .replace('{username}', msg.from.username ? `@${msg.from.username}` : '')
        .replace('{fullname}', `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim());
    
    await sendNewMessage(chatId, welcomeText, {
        parse_mode: 'HTML',
        reply_markup: getMainKeyboard(config)
    });
});

// Commande /admin
bot.onText(/\/admin/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    try {
        await bot.deleteMessage(chatId, msg.message_id);
    } catch (error) {}
    
    if (userId !== ADMIN_ID) {
        await sendNewMessage(chatId, '❌ Accès refusé. Cette commande est réservée aux administrateurs.');
        return;
    }
    
    const userCount = mongoose.connection.readyState === 1 ? 
        await User.countDocuments() : 'N/A';
    
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    const adminText = `🔧 <b>Panel d'administration</b>\n\n` +
        `📊 <b>Statistiques:</b>\n` +
        `• Utilisateurs: ${userCount}\n` +
        `• En ligne depuis: ${hours}h ${minutes}min\n` +
        `• Mémoire: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\n\n` +
        `Que souhaitez-vous faire?`;
    
    await sendNewMessage(chatId, adminText, {
        parse_mode: 'HTML',
        reply_markup: getAdminKeyboard()
    });
});

// Gestion des erreurs globales
bot.on('error', (error) => {
    console.error('Erreur bot:', error);
});

bot.on('webhook_error', (error) => {
    console.error('Erreur webhook:', error);
});

// Gestion de l'arrêt propre
process.on('SIGTERM', async () => {
    console.log('⚠️ SIGTERM reçu, arrêt en cours...');
    
    if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
    }
    
    try {
        await bot.deleteWebHook();
        await mongoose.connection.close();
    } catch (error) {
        console.error('Erreur lors de l\'arrêt:', error);
    }
    
    process.exit(0);
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Serveur démarré sur le port ${PORT}`);
    console.log(`📍 URL webhook: ${WEBHOOK_URL}${WEBHOOK_PATH}`);
    
    // Initialiser le bot après le démarrage du serveur
    initializeBot();
});