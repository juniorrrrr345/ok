# 🔧 Vérification des Variables d'Environnement Vercel

## ⚠️ Erreur Actuelle
**"Configuration serveur incorrecte. Veuillez contacter l'administrateur."**

Cette erreur signifie que `ADMIN_PASSWORD` n'est pas défini sur Vercel.

## ✅ Variables Requises sur Vercel

Allez sur **Vercel Dashboard → Settings → Environment Variables** et assurez-vous d'avoir :

### 1. ADMIN_PASSWORD (OBLIGATOIRE)
```
Key: ADMIN_PASSWORD
Value: [Votre mot de passe sécurisé]
Environment: ✅ Production ✅ Preview ✅ Development
```

### 2. MONGODB_URI (OBLIGATOIRE)
```
Key: MONGODB_URI
Value: mongodb+srv://username:password@cluster.mongodb.net/database
Environment: ✅ Production ✅ Preview ✅ Development
```

### 3. NEXTAUTH_SECRET (Optionnel mais recommandé)
```
Key: NEXTAUTH_SECRET
Value: [Générer avec: openssl rand -base64 32]
Environment: ✅ Production ✅ Preview ✅ Development
```

### 4. NEXTAUTH_URL (Optionnel)
```
Key: NEXTAUTH_URL
Value: https://votre-app.vercel.app
Environment: ✅ Production
```

## 🚀 Étapes de Résolution

### Étape 1 : Ajouter les Variables
1. Ouvrez [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. **Settings** → **Environment Variables**
4. Cliquez **"Add New"** pour chaque variable manquante
5. Remplissez Key et Value
6. **IMPORTANT** : Cochez les 3 environnements
7. Cliquez **"Save"**

### Étape 2 : Redéployer (OBLIGATOIRE!)
Les variables ne sont prises en compte qu'après redéploiement :

**Option A - Via Dashboard :**
- **Deployments** → **...** → **Redeploy**

**Option B - Via Git :**
```bash
git add .
git commit -m "Force redeploy with environment variables"
git push origin main
```

### Étape 3 : Vérifier
Après redéploiement (2-3 minutes), testez :

1. **Route de diagnostic** :
   ```
   https://votre-app.vercel.app/api/admin/check-env
   ```
   Devrait afficher : `"✅ ADMIN_PASSWORD est défini correctement."`

2. **Connexion admin** :
   ```
   https://votre-app.vercel.app/admin
   ```
   Utilisez votre nouveau mot de passe

## 🐛 Débuggage

### Vérifier les Logs Vercel
1. Dashboard Vercel → **Functions**
2. Cliquez sur **"View Function Logs"**
3. Cherchez les erreurs liées à `ADMIN_PASSWORD`

### Tester l'API directement
```bash
curl -X POST https://votre-app.vercel.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"votre_mot_de_passe"}'
```

## ❓ FAQ

### Q: J'ai ajouté la variable mais ça ne marche toujours pas
**R:** Avez-vous redéployé ? Les variables ne sont chargées qu'au démarrage de l'application.

### Q: Comment voir si mes variables sont bien définies ?
**R:** Utilisez `/api/admin/check-env` ou regardez les logs dans Vercel Dashboard.

### Q: Puis-je utiliser des caractères spéciaux dans le mot de passe ?
**R:** Oui, mais évitez les guillemets (`"` et `'`) qui peuvent causer des problèmes.

### Q: La variable est définie mais toujours l'erreur
**R:** Vérifiez :
1. Pas d'espaces avant/après le nom de la variable
2. Pas de guillemets autour de la valeur (Vercel les ajoute automatiquement)
3. Les 3 environnements sont cochés
4. Vous avez bien redéployé après l'ajout

## 📝 Exemple de Configuration Complète

```
ADMIN_PASSWORD=MonSuperMotDePasse2024!
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mabase
NEXTAUTH_SECRET=h3K8gXdq3hyD9JjU4smB5rrVrEbD6hs=
NEXTAUTH_URL=https://lamainvrtr.vercel.app
```

## 🆘 Support

Si le problème persiste après avoir suivi toutes ces étapes :
1. Vérifiez les logs Vercel pour plus de détails
2. Essayez de supprimer et recréer la variable
3. Contactez le support Vercel si nécessaire