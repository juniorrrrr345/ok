# 🔒 Guide de Sécurité Telegram - Protection Anti-Ban

## ✅ PROTECTIONS IMPLÉMENTÉES

### 1. **Rate Limiting (Limitation de débit)**
- ✅ **Maximum 25 messages par seconde** (limite Telegram: 30/sec)
- ✅ **Délai de 1.1 seconde entre chaque batch** de 25 messages
- ✅ **Pause de 5 secondes** après une erreur 429 (Too Many Requests)
- ✅ **Système de retry intelligent** avec maximum 2 tentatives

### 2. **Système de Consentement (RGPD/Anti-Spam)**
- ✅ **Commande `/notifications`** pour gérer les préférences
- ✅ **Opt-in par défaut** : Les nouveaux utilisateurs ont les notifications activées
- ✅ **Footer de désinscription** dans chaque message de broadcast
- ✅ **Exclusion automatique** des utilisateurs ayant bloqué le bot

### 3. **Mode Webhook (Recommandé pour Render)**
- ✅ **Pas de polling** : Évite les conflits et les bannissements
- ✅ **Configuration automatique** du webhook au démarrage
- ✅ **Routes de santé** pour maintenir le service actif

### 4. **Gestion des Erreurs**
- ✅ **Détection des utilisateurs bloqués** (erreur 403)
- ✅ **Marquage dans la base de données** des utilisateurs bloqués
- ✅ **Statistiques détaillées** après chaque broadcast
- ✅ **Retry intelligent** en cas d'erreur temporaire

## 📊 LIMITES TELEGRAM À RESPECTER

| Limite | Valeur | Notre Configuration |
|--------|---------|-------------------|
| Messages par seconde | 30 max | 25 (sécurité) |
| Messages à un utilisateur | 1 par seconde | Respecté ✅ |
| Taille du message | 4096 caractères | À vérifier manuellement |
| Médias par seconde | 20 max | Non utilisé |
| Requêtes API par seconde | 30 max | 25 max ✅ |

## ⚠️ COMPORTEMENTS À ÉVITER

### ❌ **NE JAMAIS FAIRE :**
1. Envoyer des messages non sollicités (spam)
2. Dépasser 30 messages par seconde
3. Envoyer le même message trop rapidement
4. Ignorer les erreurs 429 (rate limit)
5. Utiliser plusieurs bots pour contourner les limites
6. Envoyer du contenu illégal ou offensant

### ✅ **BONNES PRATIQUES :**
1. Toujours demander le consentement
2. Fournir une option de désinscription claire
3. Espacer les envois de messages
4. Gérer proprement les erreurs
5. Monitorer les statistiques d'envoi
6. Respecter les utilisateurs qui bloquent le bot

## 🚀 UTILISATION DU BROADCAST

### Pour l'administrateur :
1. Aller dans le menu admin : `/admin`
2. Choisir "📢 Envoyer un message à tous"
3. Le bot affiche :
   - Nombre total d'utilisateurs
   - Nombre d'utilisateurs éligibles (notifications ON)
4. Taper le message à envoyer
5. Le bot envoie avec :
   - Progression en temps réel
   - Respect automatique des limites
   - Statistiques finales

### Pour les utilisateurs :
1. Commande `/notifications` pour gérer les préférences
2. Choix simple : Activer/Désactiver
3. Modification possible à tout moment
4. Footer dans chaque broadcast pour se désinscrire

## 📈 MONITORING

### Statistiques fournies après chaque broadcast :
- ✅ Messages envoyés avec succès
- ❌ Échecs techniques
- 🚫 Utilisateurs ayant bloqué le bot
- 📊 Taux de succès en pourcentage

### Logs importants :
```
⏳ Rate limit - Attente 5000ms...  // Pause automatique
✅ Connecté à MongoDB              // Base de données OK
🔗 Webhook configuré: https://...   // Webhook actif
```

## 🔧 CONFIGURATION RENDER

### Variables d'environnement requises :
```env
BOT_TOKEN=votre_token_bot
ADMIN_ID=votre_id_telegram
MONGODB_URI=mongodb://... (optionnel)
WEBHOOK_URL=auto (fourni par Render)
```

### Type de service :
- ✅ Utiliser **Web Service** (pas Worker)
- ✅ Le webhook sera configuré automatiquement
- ✅ Routes de santé pour éviter la mise en veille

## 🆘 DÉPANNAGE

### Si le bot est banni :
1. **Bannissement temporaire** (quelques heures à 24h)
   - Attendre la levée automatique
   - Réduire le rythme d'envoi après

2. **Bannissement permanent**
   - Contacter @SpamBot sur Telegram
   - Expliquer la situation
   - Promettre de respecter les règles

### Prévention :
- Surveiller le nombre d'échecs lors des broadcasts
- Si > 30% d'échecs : réduire la vitesse
- Nettoyer régulièrement les utilisateurs bloqués
- Ne jamais forcer l'envoi après une erreur

## 📝 CHECKLIST AVANT DÉPLOIEMENT

- [ ] Bot utilise `bot-complete.js` avec webhook
- [ ] Rate limiting configuré (25 msg/sec max)
- [ ] Système de consentement actif
- [ ] Gestion des erreurs 429 implémentée
- [ ] Variables d'environnement configurées
- [ ] MongoDB connecté (optionnel mais recommandé)
- [ ] render.yaml utilise type: web (pas worker)

## 💡 RECOMMANDATIONS FINALES

1. **Commencer doucement** : Tester avec peu d'utilisateurs
2. **Monitorer** : Surveiller les logs et statistiques
3. **Être transparent** : Informer les utilisateurs
4. **Respecter** : Ne jamais spammer
5. **Documenter** : Garder une trace des broadcasts

---

✅ **Votre bot est maintenant configuré pour respecter toutes les règles de Telegram et éviter le bannissement !**