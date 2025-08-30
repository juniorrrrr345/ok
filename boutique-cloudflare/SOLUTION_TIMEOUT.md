# 🔥 SOLUTION : Bot qui ne répond plus après 10 minutes

## ❌ Le Problème
Votre bot utilise actuellement le mode **polling** (`bot.js`) qui :
- Se déconnecte après 10 minutes d'inactivité
- Est mis en veille par Render/Railway
- Ne répond plus aux commandes `/start` et `/admin`

## ✅ La Solution : Webhook + Keep-Alive

### 1️⃣ Utilisez le nouveau fichier
```bash
# Au lieu de :
node bot.js

# Utilisez :
node bot-webhook-production.js
```

### 2️⃣ Configuration Render
Dans les variables d'environnement de Render :
```
BOT_TOKEN=votre_token_bot
ADMIN_ID=votre_id_telegram  
NODE_ENV=production
ENABLE_KEEPALIVE=true
```

### 3️⃣ Activez UptimeRobot (OBLIGATOIRE!)
1. Créez un compte sur [uptimerobot.com](https://uptimerobot.com)
2. Ajoutez un moniteur :
   - URL : `https://votre-bot.onrender.com/health`
   - Interval : 5 minutes

### 4️⃣ Résultat
- ✅ Bot actif 24/7
- ✅ Réponse instantanée
- ✅ Plus de timeout
- ✅ Dashboard web sur `https://votre-bot.onrender.com`

## 🚀 Déploiement Rapide

### Sur Render :
1. Changez le **Start Command** : `npm start`
2. Le `package.json` est déjà configuré pour utiliser `bot-webhook-production.js`
3. Redéployez

### Vérification :
```bash
# Testez le webhook
curl https://votre-bot.onrender.com/webhook-info

# Vérifiez la santé
curl https://votre-bot.onrender.com/health
```

## 📝 Différences Clés

| bot.js (ancien) | bot-webhook-production.js (nouveau) |
|-----------------|-------------------------------------|
| Mode Polling | Mode Webhook |
| Timeout après 10min | Actif 24/7 |
| Pas de keep-alive | Keep-alive automatique |
| Pas de dashboard | Dashboard web inclus |
| Reconnexion manuelle | Reconnexion automatique |

## 🆘 Dépannage

**Le bot ne répond toujours pas ?**
1. Vérifiez que vous utilisez bien `bot-webhook-production.js`
2. Vérifiez que UptimeRobot ping votre bot
3. Supprimez l'ancien webhook : 
   ```bash
   curl https://api.telegram.org/bot<TOKEN>/deleteWebhook
   ```
4. Redéployez sur Render

**Erreur 409 Conflict ?**
- Arrêtez toutes les autres instances du bot
- Un seul processus doit utiliser le token

## 💡 Conseil Pro

Le fichier `bot-webhook-production.js` inclut :
- 🔄 Reconnexion MongoDB automatique
- 📊 Dashboard de monitoring
- 🛡️ Gestion d'erreurs robuste
- ⚡ Performance optimisée
- 🔔 Keep-alive intégré

C'est la solution définitive pour un bot Telegram professionnel et fiable !