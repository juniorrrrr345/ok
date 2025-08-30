const mongoose = require('mongoose');

// Schéma pour la configuration du bot
const configSchema = new mongoose.Schema({
    welcomeMessage: { type: String, default: 'Bienvenue!' },
    welcomeImage: String,
    socialLinks: {
        telegram: String,
        instagram: String,
        whatsapp: String,
        tiktok: String,
        youtube: String,
        facebook: String,
        twitter: String,
        website: String
    },
    socialLayout: { type: String, default: 'grid' },
    adminIds: [Number]
}, { timestamps: true });

// Schéma pour les utilisateurs
const userSchema = new mongoose.Schema({
    userId: { type: Number, required: true, unique: true },
    username: String,
    firstName: String,
    lastName: String,
    isAdmin: { type: Boolean, default: false },
    notificationsEnabled: { type: Boolean, default: true }, // Consentement pour les notifications
    botBlocked: { type: Boolean, default: false }, // Si l'utilisateur a bloqué le bot
    botBlockedAt: Date, // Date du blocage
    firstSeen: { type: Date, default: Date.now },
    lastSeen: { type: Date, default: Date.now }
}, { timestamps: true });

const Config = mongoose.model('Config', configSchema);
const User = mongoose.model('User', userSchema);

module.exports = { Config, User };