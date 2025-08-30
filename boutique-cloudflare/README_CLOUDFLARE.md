# 🚀 Boutique E-commerce sur Cloudflare

Cette boutique a été adaptée pour fonctionner entièrement sur l'infrastructure Cloudflare, remplaçant MongoDB par D1 et Cloudinary par R2/Images.

## 📋 Technologies utilisées

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Cloudflare Workers
- **Base de données**: Cloudflare D1 (SQL)
- **Stockage**: Cloudflare KV (cache et sessions)
- **Images**: Cloudflare R2 ou Cloudflare Images
- **Hébergement**: Cloudflare Pages
- **Bot**: Telegram Bot API avec webhooks

## 🛠️ Configuration requise

1. Un compte Cloudflare (gratuit ou payant)
2. Wrangler CLI installé (`npm install -g wrangler`)
3. Node.js 18+ et npm

## 📦 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/juniorrrrr345/ok.git
cd ok
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer Cloudflare

```bash
# Se connecter à Cloudflare
wrangler login

# Créer la base de données D1
wrangler d1 create boutique-db

# Créer les KV namespaces
wrangler kv:namespace create CACHE
wrangler kv:namespace create SESSIONS
wrangler kv:namespace create CONFIG

# Créer le bucket R2 pour les images
wrangler r2 bucket create boutique-images
```

### 4. Configurer wrangler.toml

Mettez à jour le fichier `wrangler.toml` avec vos IDs :

```toml
[[d1_databases]]
binding = "DB"
database_name = "boutique-db"
database_id = "VOTRE_DATABASE_ID"

[[kv_namespaces]]
binding = "CACHE"
id = "VOTRE_KV_CACHE_ID"

[[kv_namespaces]]
binding = "SESSIONS"
id = "VOTRE_KV_SESSIONS_ID"

[[kv_namespaces]]
binding = "CONFIG"
id = "VOTRE_KV_CONFIG_ID"

[[r2_buckets]]
binding = "IMAGES"
bucket_name = "boutique-images"
```

### 5. Initialiser la base de données

```bash
# Exécuter le schéma SQL
wrangler d1 execute boutique-db --file=./schema.sql
```

### 6. Variables d'environnement

Créez un fichier `.env.local` :

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=votre_bot_token
TELEGRAM_WEBHOOK_SECRET=votre_secret

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=votre_mot_de_passe

# URLs
NEXT_PUBLIC_APP_URL=https://votre-boutique.pages.dev
R2_PUBLIC_URL=https://pub-xxx.r2.dev

# Optionnel: Cloudflare Images
CF_ACCOUNT_ID=votre_account_id
CF_IMAGES_TOKEN=votre_token
```

## 🚀 Déploiement

### 1. Déployer le Worker (API)

```bash
npm run worker:deploy
```

### 2. Construire le frontend

```bash
npm run build
```

### 3. Déployer sur Cloudflare Pages

```bash
npm run deploy:pages
```

Ou via l'interface Cloudflare Pages :
1. Allez sur dash.cloudflare.com
2. Pages > Create a project
3. Connectez votre repository GitHub
4. Build settings:
   - Build command: `npm run build`
   - Build output directory: `.vercel/output/static`

### 4. Configurer le webhook Telegram

```bash
curl -F "url=https://votre-worker.workers.dev/api/telegram-webhook" \
     -F "secret_token=votre_secret" \
     https://api.telegram.org/bot<TOKEN>/setWebhook
```

## 📱 Configuration du Bot Telegram

1. Créez un bot avec @BotFather
2. Obtenez le token
3. Configurez le webhook (voir ci-dessus)
4. Configurez les commandes :
   ```
   /start - Démarrer
   /help - Aide
   /products - Voir les produits
   /orders - Mes commandes
   ```

## 🔧 Commandes disponibles

```bash
# Développement local
npm run dev          # Frontend Next.js
npm run worker:dev   # Worker API

# Build et déploiement
npm run build        # Build frontend
npm run deploy       # Déployer le worker
npm run deploy:pages # Déployer sur Pages

# Base de données
npm run db:init      # Initialiser la DB
npm run db:migrate   # Appliquer les migrations
```

## 💰 Coûts Cloudflare

### Plan gratuit inclut :
- 100,000 requêtes Workers/jour
- 1 GB stockage D1
- 100,000 lectures D1/jour
- 1,000 écritures D1/jour
- 100,000 opérations KV/jour
- 10 GB stockage R2
- Bande passante illimitée

### Plan Workers Paid ($5/mois) :
- 10 millions requêtes/mois
- Plus de ressources D1 et KV
- Support prioritaire

## 🔍 Différences avec la version MongoDB/Cloudinary

| Fonctionnalité | Avant (MongoDB/Cloudinary) | Après (Cloudflare) |
|---------------|---------------------------|-------------------|
| Base de données | MongoDB (NoSQL) | D1 (SQL) |
| Stockage images | Cloudinary | R2/Images |
| Cache | Aucun | KV Store |
| API | Next.js API Routes | Workers |
| Hébergement | Vercel | Cloudflare Pages |
| Coût | ~$20+/mois | $0-5/mois |
| Performance | Bonne | Excellente (edge) |

## 📝 Structure des données

### Tables D1 (SQL)
- `products` - Produits de la boutique
- `categories` - Catégories de produits
- `orders` - Commandes
- `order_items` - Articles des commandes
- `users` - Utilisateurs Telegram
- `bot_config` - Configuration du bot
- `social_networks` - Réseaux sociaux

### KV Stores
- `CACHE` - Cache des données fréquentes
- `SESSIONS` - Sessions utilisateurs
- `CONFIG` - Configuration globale

### R2 Buckets
- `boutique-images` - Stockage des images produits

## 🆘 Support

Pour toute question ou problème :
1. Vérifiez les logs : `wrangler tail`
2. Dashboard Cloudflare pour les métriques
3. Créez une issue sur GitHub

## 📄 Licence

MIT

---

**Note**: Cette boutique est optimisée pour Cloudflare et offre de meilleures performances et des coûts réduits par rapport à la version MongoDB/Cloudinary.