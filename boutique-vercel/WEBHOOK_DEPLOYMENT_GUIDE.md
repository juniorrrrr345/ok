# 🚀 Guide de Déploiement Bot Telegram Webhook

## 📌 Pourquoi le bot ne répond plus après 10 minutes ?

Les services d'hébergement gratuits (Render, Railway, Heroku) mettent votre application en veille après une période d'inactivité pour économiser des ressources. Cela cause :
- ❌ Bot qui ne répond plus aux commandes
- ❌ Délai de 30-60 secondes au réveil
- ❌ Perte de connexion après 10-15 minutes

## ✅ Solution : Bot Webhook avec Keep-Alive

### 1. Utiliser le bon fichier

```bash
# Utilisez bot-webhook-production.js au lieu de bot.js
node bot-webhook-production.js
```

### 2. Configuration des variables d'environnement

Créez un fichier `.env` basé sur `.env.example` :

```env
BOT_TOKEN=votre_token_bot
ADMIN_ID=votre_id_telegram
NODE_ENV=production
ENABLE_KEEPALIVE=true
```

### 3. Déploiement sur Render

#### Étape 1 : Préparer le projet
```bash
# Dans package.json, modifiez le script start
"scripts": {
  "start": "node bot-webhook-production.js"
}
```

#### Étape 2 : Sur Render
1. Connectez votre repo GitHub
2. Type : **Web Service**
3. Build Command : `npm install`
4. Start Command : `npm start`
5. Ajoutez les variables d'environnement

#### Étape 3 : Keep-Alive Externe (IMPORTANT!)

Le keep-alive interne ne suffit pas. Configurez **UptimeRobot** :

1. Créez un compte gratuit sur [uptimerobot.com](https://uptimerobot.com)
2. Ajoutez un nouveau moniteur :
   - **Type:** HTTP(s)
   - **URL:** `https://votre-bot.onrender.com/health`
   - **Interval:** 5 minutes
3. Activez les notifications (optionnel)

### 4. Fonctionnalités du bot-webhook-production.js

#### ✨ Keep-Alive Automatique
- Ping automatique toutes les 5 minutes
- Empêche la mise en veille
- Dashboard de statut sur `/`

#### 🔄 Reconnexion Automatique
- Reconnexion MongoDB automatique
- Retry en cas d'échec
- Mode dégradé sans MongoDB

#### 📊 Dashboard Web
Visitez `https://votre-bot.onrender.com` pour voir :
- État du bot
- Temps de fonctionnement
- Utilisation mémoire
- Statut webhook

#### 🛡️ Gestion d'erreurs robuste
- Capture toutes les erreurs
- Logs détaillés
- Arrêt propre (SIGTERM)

### 5. Vérification du Webhook

#### Tester le webhook :
```bash
curl https://votre-bot.onrender.com/webhook-info
```

#### Vérifier la santé :
```bash
curl https://votre-bot.onrender.com/health
```

### 6. Commandes du Bot

- `/start` - Message de bienvenue
- `/admin` - Panel d'administration (admin seulement)
- `/id` - Obtenir son ID Telegram

### 7. Dépannage

#### Le bot ne répond pas ?
1. Vérifiez les logs sur Render
2. Testez `/health` dans le navigateur
3. Vérifiez que UptimeRobot ping bien votre bot
4. Vérifiez le webhook : `/webhook-info`

#### Erreur 409 Conflict ?
Un autre processus utilise le bot. Solutions :
1. Arrêtez tous les autres instances
2. Supprimez le webhook : 
```bash
curl https://api.telegram.org/bot<TOKEN>/deleteWebhook
```
3. Redéployez

#### MongoDB timeout ?
Le bot fonctionne sans MongoDB. C'est optionnel.

### 8. Monitoring Recommandé

#### Services gratuits :
- **UptimeRobot** - Monitoring et keep-alive
- **Cronitor** - Alternative à UptimeRobot
- **Freshping** - Monitoring avec alertes

#### Configuration optimale :
- Ping toutes les 5 minutes
- Timeout de 30 secondes
- Alertes par email/Telegram

### 9. Script de démarrage optimisé

Créez `start.sh` :
```bash
#!/bin/bash
# Kill any existing node processes
pkill -f node || true

# Clear npm cache
npm cache clean --force

# Install dependencies
npm install

# Start the bot
node bot-webhook-production.js
```

### 10. Variables d'environnement complètes

```env
# OBLIGATOIRES
BOT_TOKEN=8128299360:AAEWmbRLjkTaQYP17GsiGm5vhQv8AcJLKIY
ADMIN_ID=7670522278

# RECOMMANDÉES
NODE_ENV=production
ENABLE_KEEPALIVE=true

# OPTIONNELLES
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/botdb
WEBHOOK_URL=https://mon-bot.onrender.com
PORT=3000
```

## 🎯 Résultat Final

Avec cette configuration :
- ✅ Bot actif 24/7
- ✅ Réponse instantanée
- ✅ Pas de timeout après 10 minutes
- ✅ Dashboard de monitoring
- ✅ Reconnexion automatique
- ✅ 100% gratuit

## 📞 Support

Si vous avez des problèmes :
1. Vérifiez les logs dans Render
2. Testez l'endpoint `/health`
3. Vérifiez UptimeRobot
4. Consultez les logs du bot