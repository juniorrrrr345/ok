# Boutique Shop

Une boutique en ligne moderne construite avec Next.js 14, React 18 et MongoDB.

## Fonctionnalités

- 🛍️ **Boutique complète** : Catalogue de produits avec catégories et filtres
- 👨‍💼 **Panel Admin** : Gestion complète des produits, catégories, et paramètres
- 📱 **Responsive** : Interface adaptée mobile et desktop
- 🎨 **Thème personnalisable** : Arrière-plans et styles configurables
- 🔒 **Sécurisé** : Authentification admin protégée
- ☁️ **Upload d'images** : Intégration Cloudinary pour les médias
- 🚀 **Optimisé Vercel** : Configuration prête pour le déploiement

## Technologies utilisées

- **Frontend** : Next.js 14, React 18, TypeScript
- **Styling** : Tailwind CSS
- **Base de données** : MongoDB avec Mongoose
- **Upload d'images** : Cloudinary
- **Déploiement** : Vercel
- **UI** : Lucide React Icons

## Installation

1. Clonez le repository :
```bash
git clone https://github.com/juniorrrrr345/ok.git
cd ok
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez les variables d'environnement :
Créez un fichier `.env.local` avec :
```env
MONGODB_URI=your_mongodb_connection_string
ADMIN_PASSWORD=your_admin_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

4. Lancez le serveur de développement :
```bash
npm run dev
```

5. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Panel Admin

Accédez au panel admin via `/admin` et connectez-vous avec le mot de passe configuré.

### Fonctionnalités Admin :
- **Produits** : Ajouter, modifier, supprimer des produits
- **Catégories** : Gérer les catégories de produits
- **Farms** : Organiser par fermes/fournisseurs
- **Configuration** : Personnaliser l'apparence et les paramètres
- **Pages** : Gérer le contenu des pages info/contact
- **Réseaux sociaux** : Configurer les liens sociaux

## Déploiement sur Vercel

1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement dans les paramètres Vercel
3. Déployez automatiquement !

Le projet est déjà configuré avec `vercel.json` pour un déploiement optimal.

## Structure du projet

```
src/
├── app/                 # Pages Next.js 14 (App Router)
├── components/          # Composants React
│   └── admin/          # Composants du panel admin
├── lib/                # Utilitaires et configuration
├── models/             # Modèles MongoDB
└── hooks/              # Hooks React personnalisés
```

## Support

Pour toute question ou problème, ouvrez une issue sur GitHub.