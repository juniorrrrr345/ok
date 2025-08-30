# Boutique Cloudflare

Une boutique e-commerce moderne construite sur l'infrastructure Cloudflare, utilisant D1 (base de données), R2 (stockage d'images) et Workers (API).

## 🚀 Technologies

- **Cloudflare Workers** : API et logique métier
- **Cloudflare D1** : Base de données SQLite serverless (remplace MongoDB)
- **Cloudflare R2** : Stockage d'images et fichiers (remplace Cloudinary)
- **TypeScript** : Typage fort pour une meilleure DX

## 📦 Fonctionnalités

- ✅ Gestion des produits (CRUD)
- ✅ Upload d'images vers R2
- ✅ Base de données D1 optimisée
- ✅ API REST complète
- ✅ Authentification simple
- ✅ Gestion du panier
- ✅ Commandes et paiements

## 🛠️ Installation

```bash
# Installer les dépendances
npm install

# Configurer Wrangler (CLI Cloudflare)
npx wrangler login

# Créer la base de données D1
npx wrangler d1 create boutique

# Initialiser le schéma
npm run db:init

# Lancer en développement
npm run dev
```

## 🗃️ Base de données

La base de données utilise Cloudflare D1 (SQLite) avec les tables :
- `products` : Catalogue produits
- `users` : Utilisateurs
- `orders` : Commandes
- `cart_items` : Articles du panier

## 📁 Structure

```
boutique-cloudflare/
├── worker.js          # Worker principal
├── schema.sql         # Schéma base de données
├── wrangler.toml      # Configuration Cloudflare
├── package.json       # Dépendances
└── README.md          # Documentation
```

## 🌐 Déploiement

```bash
# Déployer sur Cloudflare
npm run deploy
```

Votre boutique sera accessible sur `https://boutique.votre-subdomain.workers.dev`