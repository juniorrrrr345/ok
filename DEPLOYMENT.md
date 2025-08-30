# 🚀 Guide de Déploiement - Boutique Cloudflare

## Prérequis

1. Compte Cloudflare (gratuit)
2. Node.js installé
3. Git configuré

## 📋 Étapes de Déploiement

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration Cloudflare

```bash
# Se connecter à Cloudflare
npx wrangler login

# Suivre les instructions dans le navigateur
```

### 3. Créer la base de données D1

```bash
# Créer la base de données
npx wrangler d1 create boutique

# Copier l'ID de base de données affiché
# Remplacer YOUR_DATABASE_ID dans wrangler.toml
```

### 4. Créer le bucket R2 pour les images

```bash
# Créer le bucket R2
npx wrangler r2 bucket create boutique-images

# Le bucket sera automatiquement configuré
```

### 5. Initialiser la base de données

```bash
# Exécuter le schéma SQL
npx wrangler d1 execute boutique --file=./schema.sql

# Vérifier que les tables sont créées
npx wrangler d1 execute boutique --command="SELECT name FROM sqlite_master WHERE type='table';"
```

### 6. Configurer wrangler.toml

Éditez `wrangler.toml` et remplacez :
- `YOUR_DATABASE_ID` par l'ID de votre base D1
- `YOUR_PREVIEW_DATABASE_ID` par l'ID de preview (optionnel)

### 7. Test en local

```bash
# Lancer en développement
npm run dev

# Tester l'API
curl http://localhost:8787/api/products
```

### 8. Déploiement en production

```bash
# Déployer sur Cloudflare
npm run deploy

# Votre boutique sera accessible sur :
# https://boutique.votre-subdomain.workers.dev
```

## 🔧 Configuration Post-Déploiement

### Variables d'environnement

```bash
# Définir le secret JWT (IMPORTANT pour la sécurité)
npx wrangler secret put JWT_SECRET

# Définir le mot de passe admin
npx wrangler secret put ADMIN_PASSWORD
```

### Domaine personnalisé (optionnel)

1. Aller dans Cloudflare Dashboard
2. Workers & Pages → boutique
3. Settings → Triggers → Add Custom Domain

## 📊 Monitoring

- **Logs** : `npx wrangler tail`
- **Analytics** : Cloudflare Dashboard → Workers & Pages
- **D1 Metrics** : Dashboard → D1 → boutique

## 🔒 Sécurité

1. **Changez le JWT_SECRET** en production
2. **Changez ADMIN_PASSWORD** 
3. **Configurez les CORS** selon vos besoins
4. **Limitez les uploads** R2 si nécessaire

## 🐛 Dépannage

### Erreur "Database not found"
```bash
# Vérifier l'ID de base de données
npx wrangler d1 list
```

### Erreur "Bucket not found"
```bash
# Vérifier les buckets R2
npx wrangler r2 bucket list
```

### Worker ne démarre pas
```bash
# Vérifier la syntaxe
npx wrangler dev --local
```

## 📈 Limites Cloudflare (Plan Gratuit)

- **Workers** : 100,000 requêtes/jour
- **D1** : 5 Go de stockage, 25 millions de lectures/mois
- **R2** : 10 Go de stockage, 1 million de requêtes/mois

Pour plus de trafic, passer au plan payant ($5/mois).

## 🎯 Prochaines Étapes

1. Personnaliser le design
2. Ajouter Stripe pour les paiements
3. Implémenter les notifications email
4. Ajouter une interface d'administration
5. Optimiser les performances avec cache