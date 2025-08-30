# 🚀 COMMANDES EXACTES POUR DÉPLOIEMENT

## 📋 COPIEZ-COLLEZ CES COMMANDES DANS VOTRE TERMINAL :

### 1. Préparer le projet
```bash
# Aller dans le dossier du projet
cd /workspace

# Mettre à jour wrangler
npm install --save-dev wrangler@latest
```

### 2. Se connecter à Cloudflare
```bash
# Connexion à Cloudflare (ouvre le navigateur)
npx wrangler login
```
*Suivez les instructions dans le navigateur pour vous connecter*

### 3. Créer la base de données D1
```bash
# Créer la base de données
npx wrangler d1 create boutique

# ⚠️ IMPORTANT : Copiez l'ID qui s'affiche et remplacez-le dans wrangler.toml
```

### 4. Créer le bucket R2 pour les images
```bash
# Créer le bucket R2
npx wrangler r2 bucket create boutique-images
```

### 5. Mettre à jour wrangler.toml
Éditez le fichier `wrangler.toml` et remplacez `YOUR_DATABASE_ID` par l'ID obtenu à l'étape 3.

### 6. Initialiser la base de données
```bash
# Exécuter le schéma SQL
npx wrangler d1 execute boutique --file=./schema.sql

# Vérifier que ça marche
npx wrangler d1 execute boutique --command="SELECT COUNT(*) as products FROM products;"
```

### 7. Configurer les secrets
```bash
# Définir le secret JWT (tapez un mot de passe fort)
npx wrangler secret put JWT_SECRET

# Définir le mot de passe admin
npx wrangler secret put ADMIN_PASSWORD
```

### 8. Test en local
```bash
# Lancer en développement local
npx wrangler dev

# Dans un autre terminal, tester l'API
curl http://localhost:8787/api/products
```

### 9. Déploiement final
```bash
# Déployer sur Cloudflare
npx wrangler deploy

# Votre boutique sera accessible sur l'URL affichée
```

## 🔗 Après déploiement

Votre boutique sera accessible sur : `https://boutique.votre-subdomain.workers.dev`

### Endpoints API disponibles :
- `GET /api/products` - Liste des produits
- `POST /api/auth` - Connexion
- `POST /api/register` - Inscription  
- `POST /api/cart` - Ajouter au panier
- `POST /api/orders` - Créer une commande
- `POST /api/upload` - Upload d'images

## 🎯 Commandes Git pour GitHub

```bash
# Ajouter tous les fichiers
git add -A

# Committer
git commit -m "Boutique Cloudflare: D1 + R2 + Workers - Remplace MongoDB + Cloudinary"

# Pousser vers GitHub
git push origin main
```

Si `git push origin main` ne marche pas, essayez :
```bash
git push origin master
```

Ou forcez :
```bash
git push -f origin main
```

## ✅ Résultat

Vous aurez une boutique e-commerce complète :
- 🗄️ **Base de données D1** (remplace MongoDB)
- 📦 **Stockage R2** (remplace Cloudinary)  
- ⚡ **Workers API** ultra-rapide
- 🌍 **Déployée mondialement** sur le réseau Cloudflare