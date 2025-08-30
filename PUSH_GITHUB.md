# 🚀 COMMANDES POUR POUSSER VERS GITHUB

## Option 1 : Depuis PowerShell (Windows)

```powershell
# 1. Allez dans un bon dossier (PAS system32 !)
cd C:\Users\$env:USERNAME\Documents

# 2. Clonez le repo vide
git clone https://github.com/juniorrrrr345/ok.git
cd ok

# 3. Téléchargez les fichiers de la boutique Cloudflare depuis ce workspace
# OU copiez les fichiers manuellement

# 4. Ajoutez TOUS les fichiers
git add -A
git add .

# 5. Committez
git commit -m "Boutique Cloudflare"

# 6. Poussez FORCÉMENT
git push origin main -f
# OU
git push origin master -f
```

## Option 2 : Commandes directes (copier-coller)

```bash
cd C:\Users\%USERNAME%\Documents
rmdir /s /q ok
git clone https://github.com/juniorrrrr345/ok.git
cd ok
git add .
git commit -m "Initial"
git push
```

## Option 3 : Si rien ne marche

1. Allez sur https://github.com/juniorrrrr345/ok
2. Cliquez sur "Add file" > "Upload files"
3. Glissez-déposez tous les fichiers
4. Commitez directement sur GitHub

## 🔴 ERREURS COMMUNES :

### "nothing to commit"
→ Les fichiers ne sont pas dans le dossier
→ Solution : Copiez d'abord les fichiers !

### "failed to push"
→ Utilisez --force ou -f
```bash
git push -f origin main
```

### "remote rejected"
→ Le repo a des protections
→ Allez dans Settings > Branches sur GitHub et désactivez les protections