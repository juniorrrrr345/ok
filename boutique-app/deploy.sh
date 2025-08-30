#!/bin/bash

echo "🚀 Déploiement de la boutique en ligne"
echo "======================================="

# Vérifier que wrangler est installé
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler n'est pas installé. Installation..."
    npm install -g wrangler
fi

# Demander le token Cloudflare si pas déjà configuré
echo "📝 Configuration Cloudflare"
echo "Token API: GVRVHnBZU26NIwiQg445vOFyigc5WC7xmpxK-XfV"
export CLOUDFLARE_API_TOKEN="GVRVHnBZU26NIwiQg445vOFyigc5WC7xmpxK-XfV"

# Créer la base de données D1 si elle n'existe pas
echo "📊 Création de la base de données D1..."
DB_OUTPUT=$(wrangler d1 create boutique-db 2>&1)
if [[ $DB_OUTPUT == *"already exists"* ]]; then
    echo "✅ Base de données déjà existante"
else
    echo "✅ Base de données créée"
    DB_ID=$(echo "$DB_OUTPUT" | grep -oP 'database_id = "\K[^"]+')
    echo "ID de la base de données: $DB_ID"
    echo "Mettez à jour wrangler.toml avec cet ID"
fi

# Créer le bucket R2 si il n'existe pas
echo "🗂️ Création du bucket R2..."
R2_OUTPUT=$(wrangler r2 bucket create boutique-images 2>&1)
if [[ $R2_OUTPUT == *"already exists"* ]]; then
    echo "✅ Bucket déjà existant"
else
    echo "✅ Bucket créé"
fi

# Initialiser la base de données
echo "🔧 Initialisation de la base de données..."
wrangler d1 execute boutique-db --file=./schema.sql

# Déployer le Worker
echo "⚡ Déploiement du Worker API..."
wrangler deploy workers/api.ts

# Build de l'application Next.js
echo "🏗️ Build de l'application Next.js..."
npm run build

echo ""
echo "✅ Déploiement terminé !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Créez un projet sur Cloudflare Pages"
echo "2. Connectez votre repository GitHub"
echo "3. Configurez le build :"
echo "   - Build command: npm run build"
echo "   - Build output: .next"
echo "4. Ajoutez les variables d'environnement :"
echo "   - NEXT_PUBLIC_API_URL: https://boutique-api.[votre-subdomain].workers.dev"
echo ""
echo "🔐 Mot de passe admin par défaut : admin123"
echo "📍 URL du panel admin : /junior"