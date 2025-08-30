# 🛍️ IDFFULL Boutique - Duplication Complète

> Boutique e-commerce moderne avec système de panier, promotions et intégration Telegram

![Version](https://img.shields.io/badge/version-2.0-green)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)

## 🚀 Démarrage Rapide

### Option 1: Setup Automatique

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows:**
```cmd
setup.bat
```

### Option 2: Setup Manuel

```bash
# 1. Cloner le projet
git clone https://github.com/juniorrrrr345/IDFFULL.git
cd IDFFULL

# 2. Installer les dépendances
npm install

# 3. Copier le fichier d'environnement
cp .env.example .env.local

# 4. Configurer .env.local (voir ci-dessous)

# 5. Lancer le projet
npm run dev
```

## 🔑 Configuration Essentielle

### 1. MongoDB Atlas (Base de données)
1. Créez un compte gratuit sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster
3. Ajoutez un utilisateur database
4. Whitelist IP: `0.0.0.0/0`
5. Copiez l'URI de connexion

### 2. Cloudinary (Images/Vidéos)
1. Créez un compte gratuit sur [Cloudinary](https://cloudinary.com)
2. Récupérez vos credentials dans le Dashboard

### 3. Variables d'environnement (.env.local)
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/idffull
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=motdepasse_securise
```

## 📱 Fonctionnalités Principales

### Pour les Clients
- 🛒 **Panier complet** avec gestion des quantités
- 💸 **Promotions** automatiques par produit/poids
- 📱 **Commande Telegram** en un clic
- 🎥 **Vidéos produits** pour présentation
- 📱 **100% Responsive** (mobile, tablet, desktop)

### Pour l'Admin
- 📊 **Panel complet** à `/admin`
- 🏷️ **Gestion produits** avec promotions
- 📝 **Pages éditables** (Info, Contact)
- 🔧 **Configuration** complète de la boutique
- 📱 **Username Telegram** configurable

## 🗂️ Structure du Projet

```
IDFFULL/
├── src/
│   ├── app/           # Pages Next.js
│   ├── components/    # Composants React
│   ├── lib/          # Utilitaires et stores
│   └── models/       # Modèles MongoDB
├── public/           # Assets statiques
├── .env.example      # Template variables
├── setup.sh          # Script setup Linux/Mac
├── setup.bat         # Script setup Windows
└── DUPLICATION_GUIDE_COMPLETE.md  # Guide détaillé
```

## 🚀 Déploiement sur Vercel

1. **Push sur GitHub**
```bash
git add .
git commit -m "Initial setup"
git push origin main
```

2. **Import sur Vercel**
- Connectez-vous à [Vercel](https://vercel.com)
- Importez votre repo GitHub
- Ajoutez toutes les variables d'environnement
- Deploy!

## 📚 Documentation Complète

- 📖 [Guide de Duplication Détaillé](DUPLICATION_GUIDE_COMPLETE.md)
- 🚀 [Fonctionnalités Ajoutées](FEATURES_ADDED.md)
- 🔧 [Template Variables](.env.example)

## 🛠️ Commandes Utiles

```bash
npm run dev      # Développement
npm run build    # Build production
npm run start    # Start production
npm run lint     # Vérifier le code
```

## 🆘 Support & Aide

### Problèmes Fréquents

**MongoDB connection error:**
- Vérifiez l'IP whitelist (0.0.0.0/0)
- Vérifiez username/password
- Vérifiez le nom de la DB

**Images non affichées:**
- Vérifiez les credentials Cloudinary
- Taille max: 10MB

**Build error sur Vercel:**
- Vérifiez toutes les variables d'env
- Vérifiez les dépendances

## 🎯 Checklist de Duplication

- [ ] Repository cloné
- [ ] Dependencies installées
- [ ] MongoDB configuré
- [ ] Cloudinary configuré
- [ ] .env.local créé
- [ ] Admin credentials définis
- [ ] Test local réussi
- [ ] Déployé sur Vercel
- [ ] Username Telegram configuré
- [ ] Produits ajoutés
- [ ] Test commande réussi

## 📱 Compatible avec

- ✅ Telegram Mini Apps
- ✅ WhatsApp Business
- ✅ Tous navigateurs modernes
- ✅ iOS/Android
- ✅ PWA ready

---

**Créé avec ❤️ pour une expérience e-commerce moderne**