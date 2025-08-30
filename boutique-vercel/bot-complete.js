require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const mongoose = require('mongoose');
const { loadConfig, saveConfig, getImagePath } = require('./config');
const { getMainKeyboard, getAdminKeyboard, getSocialManageKeyboard, getSocialLayoutKeyboard, getConfirmKeyboard } = require('./keyboards');
const { User } = require('./models');

// Configuration Express pour Render
const app = express();
const PORT = process.env.PORT || 3000;

// Vérifier les variables d'environnement
if (!process.env.BOT_TOKEN) {
    console.error('❌ BOT_TOKEN n\'est pas défini');
    process.exit(1);
}

if (!process.env.ADMIN_ID) {
    console.error('❌ ADMIN_ID n\'est pas défini');
    process.exit(1);
}

// URL de webhook (Render fournit automatiquement RENDER_EXTERNAL_URL)
const WEBHOOK_URL = process.env.WEBHOOK_URL || process.env.RENDER_EXTERNAL_URL || 'https://your-app.onrender.com';
const WEBHOOK_PATH = `/bot${process.env.BOT_TOKEN}`;

// Initialiser le bot en mode webhook
const bot = new TelegramBot(process.env.BOT_TOKEN, { webHook: true });
const ADMIN_ID = parseInt(process.env.ADMIN_ID);

// Middleware Express
app.use(express.json());

// Route pour le webhook Telegram
app.post(WEBHOOK_PATH, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Route de santé pour Render (empêche la mise en veille)
app.get('/', (req, res) => {
    res.json({ 
        status: 'running',
        bot: 'Telegram Bot Active',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Route de santé détaillée
app.get('/health', async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
        const userCount = await User.countDocuments();
        
        res.json({ 
            status: 'healthy',
            database: dbStatus,
            users: userCount,
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            message: error.message 
        });
    }
});

// État des utilisateurs et messages actifs
const userStates = {};
const activeMessages = {};

// Configuration globale
let config = {};

// Connexion MongoDB
async function connectDB() {
    try {
        if (!process.env.MONGODB_URI) {
            console.log('⚠️ MONGODB_URI non défini, utilisation du mode fichier local');
            return false;
        }
        
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('✅ Connecté à MongoDB');
        return true;
    } catch (error) {
        console.error('❌ Erreur connexion MongoDB:', error);
        return false;
    }
}

// Initialiser le bot
async function initializeBot() {
    try {
        // Connexion à MongoDB
        const dbConnected = await connectDB();
        
        // Charger la configuration
        config = await loadConfig();
        console.log('✅ Configuration chargée');
        
        // Configurer le webhook
        const webhookUrl = `${WEBHOOK_URL}${WEBHOOK_PATH}`;
        await bot.setWebHook(webhookUrl);
        console.log(`🔗 Webhook configuré: ${webhookUrl}`);
        
    } catch (error) {
        console.error('❌ Erreur initialisation:', error);
    }
}

// Fonction pour envoyer ou éditer un message
async function sendOrEditMessage(chatId, text, keyboard = null) {
    try {
        const options = {
            parse_mode: 'HTML'
        };
        
        if (keyboard) {
            options.reply_markup = { inline_keyboard: keyboard };
        }
        
        if (activeMessages[chatId]) {
            try {
                await bot.editMessageText(text, {
                    chat_id: chatId,
                    message_id: activeMessages[chatId],
                    ...options
                });
                return;
            } catch (error) {
                // Si l'édition échoue, envoyer un nouveau message
            }
        }
        
        const message = await bot.sendMessage(chatId, text, options);
        activeMessages[chatId] = message.message_id;
    } catch (error) {
        console.error('Erreur envoi/édition message:', error);
    }
}

// Sauvegarder un utilisateur
async function saveUser(userId, userInfo = {}) {
    try {
        await User.findOneAndUpdate(
            { userId },
            {
                userId,
                username: userInfo.username,
                firstName: userInfo.first_name,
                lastName: userInfo.last_name,
                lastSeen: new Date()
            },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error('Erreur sauvegarde utilisateur:', error);
    }
}

// Fonction de broadcast sécurisée avec rate limiting
async function broadcastMessage(adminChatId, message) {
    let sent = 0;
    let failed = 0;
    let blocked = 0;
    
    try {
        // Ne récupérer que les utilisateurs consentants
        const users = await User.find({ 
            notificationsEnabled: true,
            botBlocked: { $ne: true },
            userId: { $ne: ADMIN_ID } // Exclure l'admin
        });
        
        if (users.length === 0) {
            await sendOrEditMessage(adminChatId, 
                '⚠️ Aucun utilisateur éligible pour recevoir le message.\n' +
                'Les utilisateurs doivent avoir activé les notifications.'
            );
            return;
        }
        
        await sendOrEditMessage(adminChatId, 
            `📤 Envoi en cours à ${users.length} utilisateurs...\n` +
            '⏳ Respect des limites Telegram en cours...'
        );
        
        // Configuration anti-ban
        const BATCH_SIZE = 20; // Messages par batch (conservateur)
        const BATCH_DELAY = 1500; // 1.5 secondes entre batches
        const ERROR_RETRY_DELAY = 5000; // 5 secondes après erreur 429
        const MAX_RETRIES = 2; // Nombre max de tentatives
        
        // Message avec footer
        const messageWithFooter = `📢 <b>Message de l'administrateur:</b>\n\n${message}\n\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `<i>Pour gérer vos notifications: /notifications</i>`;
        
        // Traiter par batches
        for (let i = 0; i < users.length; i += BATCH_SIZE) {
            const batch = users.slice(i, i + BATCH_SIZE);
            const batchPromises = [];
            
            for (const user of batch) {
                const sendPromise = (async () => {
                    let retries = 0;
                    while (retries < MAX_RETRIES) {
                        try {
                            await bot.sendMessage(user.userId, messageWithFooter, { 
                                parse_mode: 'HTML',
                                disable_notification: false 
                            });
                            sent++;
                            return;
                        } catch (error) {
                            if (error.response?.statusCode === 429) {
                                retries++;
                                if (retries < MAX_RETRIES) {
                                    console.log(`⏳ Rate limit - Attente ${ERROR_RETRY_DELAY}ms...`);
                                    await new Promise(r => setTimeout(r, ERROR_RETRY_DELAY));
                                } else {
                                    failed++;
                                }
                            } else if (error.response?.statusCode === 403) {
                                blocked++;
                                await User.findOneAndUpdate(
                                    { userId: user.userId },
                                    { 
                                        botBlocked: true, 
                                        botBlockedAt: new Date() 
                                    }
                                ).catch(() => {});
                                return;
                            } else {
                                failed++;
                                return;
                            }
                        }
                    }
                })();
                
                batchPromises.push(sendPromise);
            }
            
            // Attendre la fin du batch
            await Promise.all(batchPromises);
            
            // Mise à jour progression
            const progress = Math.round(((i + batch.length) / users.length) * 100);
            await sendOrEditMessage(adminChatId,
                `📤 <b>Envoi en cours...</b>\n\n` +
                `📊 Progression: ${progress}%\n` +
                `✅ Envoyés: ${sent}/${users.length}\n` +
                `❌ Échecs: ${failed}\n` +
                `🚫 Bloqués: ${blocked}`
            );
            
            // Pause entre batches
            if (i + BATCH_SIZE < users.length) {
                await new Promise(r => setTimeout(r, BATCH_DELAY));
            }
        }
        
        // Rapport final
        const successRate = Math.round((sent / users.length) * 100);
        await sendOrEditMessage(adminChatId,
            `✅ <b>Diffusion terminée!</b>\n\n` +
            `📊 <b>Rapport détaillé:</b>\n` +
            `• Taux de succès: ${successRate}%\n` +
            `• Messages envoyés: ${sent}\n` +
            `• Échecs: ${failed}\n` +
            `• Utilisateurs bloqués: ${blocked}\n` +
            `• Total traité: ${users.length}\n\n` +
            `💡 Seuls les utilisateurs avec notifications activées ont reçu le message.`
        );
        
    } catch (error) {
        console.error('Erreur broadcast:', error);
        await sendOrEditMessage(adminChatId, 
            '❌ Erreur lors de la diffusion: ' + error.message
        );
    }
}

// Commande /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    await saveUser(userId, msg.from);
    
    const welcomeText = config.welcomeMessage || 'Bienvenue sur notre bot!';
    await sendOrEditMessage(chatId, welcomeText, getMainKeyboard(config).inline_keyboard);
});

// Commande /admin
bot.onText(/\/admin/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    if (userId !== ADMIN_ID) {
        await bot.sendMessage(chatId, '❌ Accès refusé.');
        return;
    }
    
    await sendOrEditMessage(chatId, '🔧 Menu Administrateur', getAdminKeyboard().inline_keyboard);
});

// Commande /notifications
bot.onText(/\/notifications/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    try {
        let user = await User.findOne({ userId });
        
        if (!user) {
            user = await User.create({
                userId,
                username: msg.from.username,
                firstName: msg.from.first_name,
                lastName: msg.from.last_name,
                notificationsEnabled: true
            });
        }
        
        const status = user.notificationsEnabled ? '✅ Activées' : '❌ Désactivées';
        
        await sendOrEditMessage(chatId,
            `🔔 <b>Gestion des notifications</b>\n\n` +
            `État actuel: ${status}\n\n` +
            `Choisissez votre préférence:`,
            [
                [{
                    text: user.notificationsEnabled ? '🔕 Désactiver' : '🔔 Activer',
                    callback_data: user.notificationsEnabled ? 'notif_off' : 'notif_on'
                }],
                [{ text: '🔙 Retour', callback_data: 'start' }]
            ]
        );
    } catch (error) {
        console.error('Erreur notifications:', error);
        await bot.sendMessage(chatId, '❌ Erreur. Réessayez plus tard.');
    }
});

// Gestion des callbacks
bot.on('callback_query', async (callbackQuery) => {
    const action = callbackQuery.data;
    const chatId = callbackQuery.message.chat.id;
    const userId = callbackQuery.from.id;
    
    try {
        // Toujours répondre au callback pour éviter le spinner
        await bot.answerCallbackQuery(callbackQuery.id);
        
        switch (action) {
            case 'start':
                await sendOrEditMessage(chatId, 
                    config.welcomeMessage || 'Bienvenue!',
                    getMainKeyboard(config).inline_keyboard
                );
                break;
                
            case 'admin_broadcast':
                if (userId === ADMIN_ID) {
                    const totalUsers = await User.countDocuments();
                    const eligibleUsers = await User.countDocuments({ 
                        notificationsEnabled: true,
                        botBlocked: { $ne: true }
                    });
                    
                    userStates[userId] = 'waiting_broadcast';
                    await sendOrEditMessage(chatId,
                        `📢 <b>Diffusion de message</b>\n\n` +
                        `📊 Statistiques:\n` +
                        `• Total utilisateurs: ${totalUsers}\n` +
                        `• Éligibles (notifications ON): ${eligibleUsers}\n\n` +
                        `📝 Envoyez le message à diffuser:`
                    );
                }
                break;
                
            case 'notif_on':
                await User.findOneAndUpdate(
                    { userId },
                    { notificationsEnabled: true },
                    { upsert: true }
                );
                await bot.answerCallbackQuery(callbackQuery.id, {
                    text: '✅ Notifications activées!',
                    show_alert: true
                });
                await sendOrEditMessage(chatId,
                    '✅ Notifications activées!\n\n' +
                    'Vous recevrez les messages importants.',
                    [[{ text: '🔙 Menu', callback_data: 'start' }]]
                );
                break;
                
            case 'notif_off':
                await User.findOneAndUpdate(
                    { userId },
                    { notificationsEnabled: false },
                    { upsert: true }
                );
                await bot.answerCallbackQuery(callbackQuery.id, {
                    text: '🔕 Notifications désactivées',
                    show_alert: true
                });
                await sendOrEditMessage(chatId,
                    '🔕 Notifications désactivées.\n\n' +
                    'Vous ne recevrez plus de messages de diffusion.',
                    [[{ text: '🔙 Menu', callback_data: 'start' }]]
                );
                break;
                
            // Ajouter ici les autres cas de votre bot...
        }
    } catch (error) {
        console.error('Erreur callback:', error);
    }
});

// Gestion des messages texte
bot.on('message', async (msg) => {
    if (msg.text && msg.text.startsWith('/')) return;
    
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userState = userStates[userId];
    
    if (userState === 'waiting_broadcast' && userId === ADMIN_ID) {
        delete userStates[userId];
        await broadcastMessage(chatId, msg.text);
    }
});

// Démarrer le serveur
app.listen(PORT, async () => {
    console.log(`🌐 Serveur démarré sur le port ${PORT}`);
    await initializeBot();
    console.log('🤖 Bot Telegram actif en mode webhook!');
    console.log('✅ Protection anti-ban activée');
    console.log('✅ Rate limiting configuré');
    console.log('✅ Système de consentement actif');
});