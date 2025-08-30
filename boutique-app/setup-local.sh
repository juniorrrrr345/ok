#!/bin/bash

echo "🔧 Configuration de l'environnement local"
echo "========================================="

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Créer la base de données locale
echo "📊 Création de la base de données locale..."
wrangler d1 execute boutique-db --local --file=./schema.sql

echo ""
echo "✅ Configuration terminée !"
echo ""
echo "Pour lancer l'application en local :"
echo "1. Terminal 1 : npm run dev:worker"
echo "2. Terminal 2 : npm run dev"
echo ""
echo "L'application sera accessible sur :"
echo "- Frontend : http://localhost:3000"
echo "- API : http://localhost:8787"
echo "- Panel admin : http://localhost:3000/junior"
echo ""
echo "Mot de passe admin : admin123"