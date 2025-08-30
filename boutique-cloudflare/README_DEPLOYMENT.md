# Guide de Déploiement IDFFULL sur Vercel

## Prérequis
- Compte Vercel
- Repository GitHub avec le code IDFFULL
- Variables d'environnement prêtes

## Étapes de déploiement

### 1. Préparation du repository GitHub
```bash
# Si vous n'avez pas encore poussé le code
git remote add origin https://github.com/VOTRE_USERNAME/IDFFULL.git
git branch -M main
git push -u origin main
```

### 2. Import sur Vercel
1. Allez sur https://vercel.com/new
2. Connectez votre compte GitHub
3. Importez le repository IDFFULL
4. **IMPORTANT** : Configurez les paramètres suivants :
   - Framework Preset: **Next.js**
   - Root Directory: **./** (laissez vide)
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### 3. Variables d'environnement
Ajoutez TOUTES ces variables dans Vercel AVANT le premier déploiement :

```
MONGODB_URI=mongodb+srv://idffulloption:Junior30@cluster0.wdopvu5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
CLOUDINARY_CLOUD_NAME=dkluoavpv
CLOUDINARY_API_KEY=725121745967616
CLOUDINARY_API_SECRET=Z8G5NzYUDTl__-lLZHwTEJ3WjpI
CLOUDINARY_URL=cloudinary://725121745967616:Z8G5NzYUDTl__-lLZHwTEJ3WjpI@dkluoavpv
NEXT_PUBLIC_SHOP_NAME=IDFFULL
NEXT_PUBLIC_SHOP_TITLE=IDFFULL - Boutique en ligne
NEXT_PUBLIC_SHOP_DESCRIPTION=Boutique IDFFULL - Toutes les options disponibles
CLOUDINARY_UPLOAD_PRESET=ml_default
```

### 4. Configuration MongoDB Atlas
1. Connectez-vous à MongoDB Atlas
2. Allez dans Network Access
3. Ajoutez l'IP `0.0.0.0/0` pour permettre l'accès depuis Vercel

### 5. Déploiement
1. Cliquez sur "Deploy"
2. Attendez que le build se termine
3. Vérifiez les logs pour toute erreur

## Résolution des problèmes

### Erreur 404
Si vous obtenez une erreur 404 :
1. Vérifiez que le build s'est terminé avec succès
2. Allez dans les logs de fonction Vercel
3. Testez l'endpoint de santé : `https://votre-app.vercel.app/api/health`

### Erreur de connexion MongoDB
1. Vérifiez que l'IP 0.0.0.0/0 est autorisée dans MongoDB Atlas
2. Vérifiez que l'URI MongoDB est correcte
3. Testez la connexion avec : `https://votre-app.vercel.app/api/test-db`

### Images ne s'affichent pas
1. Vérifiez les credentials Cloudinary
2. Vérifiez que le preset `ml_default` existe dans votre compte Cloudinary
3. Testez l'upload depuis le panel admin

## URLs importantes
- Application : `https://votre-app.vercel.app`
- Panel Admin : `https://votre-app.vercel.app/admin`
- API Health : `https://votre-app.vercel.app/api/health`

## Support
En cas de problème, vérifiez :
1. Les logs de build dans Vercel
2. Les logs de fonction dans Vercel
3. La console du navigateur pour les erreurs côté client