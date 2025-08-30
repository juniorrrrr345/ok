# 📚 Guide de déploiement complet sur Cloudflare

Ce guide vous accompagne étape par étape pour déployer votre boutique en ligne sur Cloudflare.

## 🔑 Prérequis

- Un compte Cloudflare (gratuit)
- Node.js installé sur votre machine
- Votre token API Cloudflare : `GVRVHnBZU26NIwiQg445vOFyigc5WC7xmpxK-XfV`

## 📋 Étapes de déploiement

### Étape 1 : Configuration initiale

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd boutique-app
npm install
```

2. **Installer Wrangler (CLI Cloudflare)**
```bash
npm install -g wrangler
```

3. **Configurer l'authentification Cloudflare**
```bash
export CLOUDFLARE_API_TOKEN="GVRVHnBZU26NIwiQg445vOFyigc5WC7xmpxK-XfV"
```

### Étape 2 : Créer les ressources Cloudflare

1. **Créer la base de données D1**
```bash
wrangler d1 create boutique-db
```

Notez l'ID de la base de données qui s'affiche, par exemple :
```
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

2. **Mettre à jour wrangler.toml**
Ouvrez `wrangler.toml` et remplacez `YOUR_DATABASE_ID` par l'ID obtenu :
```toml
[[d1_databases]]
binding = "DB"
database_name = "boutique-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # <-- ICI
```

3. **Créer le bucket R2 pour les images**
```bash
wrangler r2 bucket create boutique-images
```

4. **Activer l'accès public au bucket R2**
- Allez sur [dashboard.cloudflare.com](https://dashboard.cloudflare.com)
- Naviguez vers R2 > boutique-images
- Cliquez sur "Settings"
- Dans "Public Access", activez "Allow public access"
- Copiez l'URL publique (format : `https://pub-xxxxx.r2.dev`)

5. **Mettre à jour l'URL R2 dans le worker**
Ouvrez `workers/api.ts` et remplacez la ligne 217 :
```typescript
const url = `https://pub-YOUR-ACCOUNT-ID.r2.dev/${fileName}`;
```
Par votre URL publique R2.

### Étape 3 : Initialiser la base de données

```bash
wrangler d1 execute boutique-db --file=./schema.sql
```

### Étape 4 : Déployer le Worker API

1. **Déployer le worker**
```bash
wrangler deploy workers/api.ts
```

2. **Noter l'URL du worker**
Après le déploiement, vous verrez une URL comme :
```
https://boutique-api.your-subdomain.workers.dev
```

### Étape 5 : Configurer et déployer le frontend

1. **Mettre à jour les variables d'environnement**
Créez/modifiez `.env.production` :
```env
NEXT_PUBLIC_API_URL=https://boutique-api.your-subdomain.workers.dev
```

2. **Build l'application**
```bash
npm run build
```

3. **Déployer sur Cloudflare Pages**

Option A : Via l'interface web
- Allez sur [pages.cloudflare.com](https://pages.cloudflare.com)
- Cliquez sur "Create a project"
- Choisissez "Connect to Git" et connectez votre repository
- Configuration du build :
  - Framework preset : Next.js
  - Build command : `npm run build`
  - Build output directory : `.next`
- Variables d'environnement :
  - `NEXT_PUBLIC_API_URL` : URL de votre worker

Option B : Via Wrangler CLI
```bash
npx wrangler pages deploy .next --project-name=ma-boutique
```

### Étape 6 : Configuration post-déploiement

1. **Tester l'application**
- Accédez à votre site : `https://ma-boutique.pages.dev`
- Testez le panel admin : `https://ma-boutique.pages.dev/junior`
- Mot de passe : `admin123`

2. **Configurer un domaine personnalisé (optionnel)**
- Dans Cloudflare Pages, allez dans votre projet
- Cliquez sur "Custom domains"
- Ajoutez votre domaine

## 🔧 Commandes utiles

### Développement local
```bash
# Terminal 1 : Lancer le worker
npm run dev:worker

# Terminal 2 : Lancer Next.js
npm run dev
```

### Gestion de la base de données
```bash
# Exécuter des requêtes SQL
wrangler d1 execute boutique-db --command="SELECT * FROM products"

# Réinitialiser la base de données
wrangler d1 execute boutique-db --file=./schema.sql
```

### Logs et debug
```bash
# Voir les logs du worker
wrangler tail workers/api.ts
```

## 🔐 Sécurité

### Changer le mot de passe admin

1. **Générer un nouveau hash**
```javascript
// Dans Node.js ou un outil en ligne
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('votre-nouveau-mot-de-passe', 10);
console.log(hash);
```

2. **Mettre à jour wrangler.toml**
```toml
[vars]
ADMIN_PASSWORD = "nouveau-hash-ici"
```

3. **Redéployer le worker**
```bash
wrangler deploy workers/api.ts
```

## 🚨 Dépannage

### Erreur "Database not found"
Vérifiez que l'ID de la base de données dans `wrangler.toml` est correct.

### Erreur "R2 bucket not found"
Assurez-vous que le bucket `boutique-images` existe et que le binding est correct.

### Images non visibles
1. Vérifiez que l'accès public est activé sur le bucket R2
2. Vérifiez l'URL publique dans `workers/api.ts`

### Erreur CORS
Mettez à jour les origines autorisées dans `workers/api.ts` ligne 18 :
```typescript
origin: ['http://localhost:3000', 'https://votre-domaine.com'],
```

## 📊 Monitoring

### Tableau de bord Cloudflare
- Workers & Pages : Voir les métriques et logs
- R2 : Monitorer l'utilisation du stockage
- D1 : Voir les requêtes et performances

### Limites du plan gratuit
- Workers : 100,000 requêtes/jour
- D1 : 5GB de stockage
- R2 : 10GB de stockage
- Pages : Builds illimités

## 🎉 Félicitations !

Votre boutique est maintenant en ligne ! 

Pour toute question, consultez :
- [Documentation Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Documentation Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Documentation Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Documentation Cloudflare Pages](https://developers.cloudflare.com/pages/)