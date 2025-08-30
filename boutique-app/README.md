# 🛍️ Boutique en ligne

Une boutique en ligne moderne avec panel d'administration, construite avec Next.js et Cloudflare.

## 🚀 Fonctionnalités

### Pages publiques
- **Menu** : Affichage des produits avec filtres par catégorie et farm
- **Contact** : Informations de contact et formulaire
- **Réseaux** : Liens vers les réseaux sociaux
- **Info** : Page d'information sur la boutique

### Panel administrateur (/junior)
- Gestion complète des produits (CRUD)
- Gestion des catégories et farms
- Personnalisation du design (logo, fond)
- Gestion du carrousel d'images
- Configuration des informations de la boutique

## 🛠️ Technologies utilisées

- **Frontend** : Next.js 15, TypeScript, Tailwind CSS
- **Backend** : Cloudflare Workers (Hono)
- **Base de données** : Cloudflare D1
- **Stockage** : Cloudflare R2
- **Déploiement** : Cloudflare Pages

## 📦 Installation

1. **Cloner le repository**
```bash
git clone <your-repo>
cd boutique-app
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration Cloudflare**

Installez Wrangler CLI si ce n'est pas déjà fait :
```bash
npm install -g wrangler
```

Connectez-vous à Cloudflare :
```bash
wrangler login
```

4. **Créer la base de données D1**
```bash
wrangler d1 create boutique-db
```

Copiez l'ID de la base de données et mettez à jour `wrangler.toml` :
```toml
[[d1_databases]]
binding = "DB"
database_name = "boutique-db"
database_id = "VOTRE_DATABASE_ID"
```

5. **Créer le bucket R2**
```bash
wrangler r2 bucket create boutique-images
```

6. **Initialiser la base de données**
```bash
npm run db:init:remote
```

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env.local` pour le développement :
```env
NEXT_PUBLIC_API_URL=http://localhost:8787
```

Pour la production, mettez à jour `.env.production` :
```env
NEXT_PUBLIC_API_URL=https://boutique-api.YOUR-SUBDOMAIN.workers.dev
```

### Mot de passe admin

Le mot de passe admin par défaut est `admin123`. Pour le changer :

1. Générez un nouveau hash avec bcrypt
2. Mettez à jour `ADMIN_PASSWORD` dans `wrangler.toml`

## 💻 Développement

1. **Lancer le worker Cloudflare** (dans un terminal)
```bash
npm run dev:worker
```

2. **Lancer Next.js** (dans un autre terminal)
```bash
npm run dev
```

L'application sera accessible sur :
- Frontend : http://localhost:3000
- API Worker : http://localhost:8787
- Panel admin : http://localhost:3000/junior

## 🚀 Déploiement

### 1. Déployer le Worker API

```bash
npm run deploy:worker
```

Notez l'URL du worker déployé.

### 2. Mettre à jour l'URL de l'API

Dans `.env.production`, remplacez l'URL par celle de votre worker :
```env
NEXT_PUBLIC_API_URL=https://boutique-api.YOUR-SUBDOMAIN.workers.dev
```

### 3. Build et déployer sur Cloudflare Pages

```bash
npm run build
```

Puis, créez un nouveau projet sur Cloudflare Pages :

1. Allez sur [Cloudflare Pages](https://pages.cloudflare.com/)
2. Créez un nouveau projet
3. Connectez votre repository GitHub
4. Configuration du build :
   - Build command : `npm run build`
   - Build output directory : `.next`
   - Root directory : `/`

### 4. Configuration R2 pour les images publiques

1. Dans le dashboard Cloudflare, allez dans R2
2. Sélectionnez votre bucket `boutique-images`
3. Allez dans Settings > Public Access
4. Activez l'accès public
5. Copiez l'URL publique et mettez à jour le worker

## 📝 Utilisation

### Accès au panel admin

1. Allez sur `https://votre-site.com/junior`
2. Mot de passe par défaut : `admin123`

### Gestion des produits

1. Connectez-vous au panel admin
2. Allez dans "Produits"
3. Cliquez sur "Ajouter un produit"
4. Remplissez les informations et uploadez une image

### Personnalisation du design

1. Dans le panel admin, allez dans "Design"
2. Uploadez un nouveau logo
3. Uploadez une image de fond
4. Modifiez le nom de la boutique

### Configuration des informations

1. Dans le panel admin, allez dans "Paramètres"
2. Mettez à jour les informations de contact
3. Ajoutez les liens vers vos réseaux sociaux
4. Modifiez le texte de présentation

## 🔐 Sécurité

- Changez le mot de passe admin par défaut
- Utilisez HTTPS en production
- Configurez les CORS dans le worker pour votre domaine
- Limitez l'accès au panel admin avec des règles Cloudflare si nécessaire

## 📄 Structure du projet

```
boutique-app/
├── app/                    # Pages Next.js
│   ├── junior/            # Panel admin
│   ├── contact/           # Page contact
│   ├── info/              # Page info
│   └── reseaux/           # Page réseaux
├── components/            # Composants React
├── lib/                   # Utilitaires et API client
├── workers/               # Cloudflare Workers
├── public/                # Assets statiques
├── schema.sql             # Schéma de base de données
└── wrangler.toml          # Configuration Cloudflare
```

## 🤝 Support

Pour toute question ou problème, n'hésitez pas à ouvrir une issue sur GitHub.

## 📜 License

MIT