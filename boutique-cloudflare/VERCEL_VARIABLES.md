# Variables d'environnement pour Vercel - IDFFULL

## Configuration requise pour le déploiement sur Vercel

Copiez et collez ces variables dans les paramètres de votre projet Vercel :

### 1. Configuration MongoDB
```
MONGODB_URI=mongodb+srv://idffulloption:Junior30@cluster0.wdopvu5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### 2. Configuration Cloudinary
```
CLOUDINARY_CLOUD_NAME=dkluoavpv
CLOUDINARY_API_KEY=725121745967616
CLOUDINARY_API_SECRET=Z8G5NzYUDTl__-lLZHwTEJ3WjpI
CLOUDINARY_URL=cloudinary://725121745967616:Z8G5NzYUDTl__-lLZHwTEJ3WjpI@dkluoavpv
```

### 3. Configuration de l'application
```
NEXT_PUBLIC_SHOP_NAME=IDFFULL
NEXT_PUBLIC_SHOP_TITLE=IDFFULL - Boutique en ligne
NEXT_PUBLIC_SHOP_DESCRIPTION=Boutique IDFFULL - Toutes les options disponibles
```

### 4. Upload Preset Cloudinary
```
CLOUDINARY_UPLOAD_PRESET=ml_default
```

## Instructions pour Vercel

1. Allez dans les paramètres de votre projet Vercel
2. Cliquez sur "Environment Variables"
3. Ajoutez chaque variable ci-dessus une par une
4. Assurez-vous que toutes les variables sont définies pour tous les environnements (Production, Preview, Development)
5. Redéployez votre application après avoir ajouté les variables

## Panel Administrateur

- URL : `/admin`
- Utilisateur par défaut : `admin`
- Mot de passe par défaut : `admin123`

**IMPORTANT** : Changez le mot de passe administrateur après le premier déploiement !

## Support

Si vous rencontrez des problèmes :
1. Vérifiez que toutes les variables sont correctement définies
2. Vérifiez les logs de déploiement Vercel
3. Assurez-vous que votre MongoDB Atlas accepte les connexions depuis n'importe quelle IP (0.0.0.0/0)