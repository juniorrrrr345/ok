# Script PowerShell pour créer la boutique Cloudflare
Write-Host "🚀 Création de la boutique Cloudflare..." -ForegroundColor Green

# Créer les dossiers
$folders = @(
    "src/worker",
    "src/lib", 
    "src/app/api",
    "src/components",
    "src/store",
    "public"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
}

# package.json
@'
{
  "name": "boutique-cloudflare",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "wrangler dev",
    "deploy": "wrangler deploy",
    "deploy:pages": "wrangler pages deploy .vercel/output/static --project-name=boutique-cloudflare",
    "db:init": "wrangler d1 execute boutique-db --local --file=./schema.sql",
    "worker:dev": "wrangler dev"
  },
  "dependencies": {
    "@cloudflare/workers-types": "^4.20241127.0",
    "axios": "^1.7.9",
    "next": "14.2.30",
    "node-telegram-bot-api": "^0.66.0",
    "react": "^18",
    "react-dom": "^18",
    "react-hot-toast": "^2.5.2",
    "zustand": "^5.0.7"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "autoprefixer": "^10",
    "tailwindcss": "^3",
    "typescript": "^5",
    "wrangler": "^3.101.0"
  }
}
'@ | Out-File -FilePath "package.json" -Encoding UTF8

# wrangler.toml
@'
name = "boutique-cloudflare"
main = "src/worker/api.js"
compatibility_date = "2024-12-01"
node_compat = true

[[d1_databases]]
binding = "DB"
database_name = "boutique-db"
database_id = "YOUR_DATABASE_ID"

[[kv_namespaces]]
binding = "CACHE"
id = "YOUR_KV_CACHE_ID"

[[kv_namespaces]]
binding = "CONFIG"
id = "YOUR_KV_CONFIG_ID"

[[r2_buckets]]
binding = "IMAGES"
bucket_name = "boutique-images"

[vars]
TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"
'@ | Out-File -FilePath "wrangler.toml" -Encoding UTF8

# schema.sql
@'
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT,
    image_url TEXT,
    stock INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    user_name TEXT,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT "pending",
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id TEXT UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
'@ | Out-File -FilePath "schema.sql" -Encoding UTF8

# README.md
@'
# 🛍️ Boutique E-commerce Cloudflare

Boutique e-commerce moderne utilisant l'infrastructure Cloudflare.

## 🚀 Technologies

- **Frontend**: Next.js, React, TailwindCSS  
- **Backend**: Cloudflare Workers
- **Base de données**: Cloudflare D1 (SQL)
- **Stockage**: Cloudflare R2/Images
- **Bot**: Telegram Bot API

## 📦 Installation

```bash
npm install
wrangler login
wrangler d1 create boutique-db
wrangler deploy
```

## 🔧 Configuration

1. Créer un bot Telegram avec @BotFather
2. Configurer les variables dans wrangler.toml
3. Déployer sur Cloudflare Pages

## 💰 Coûts

- Plan gratuit: 100k requêtes/jour
- Plan payant: $5/mois pour 10M requêtes

## 📄 Licence

MIT
'@ | Out-File -FilePath "README.md" -Encoding UTF8

# .gitignore
@'
node_modules/
.env
.env.local
.wrangler/
.vercel/
dist/
build/
*.log
'@ | Out-File -FilePath ".gitignore" -Encoding UTF8

# next.config.js
@'
module.exports = {
  output: "export",
  images: {
    unoptimized: true
  }
}
'@ | Out-File -FilePath "next.config.js" -Encoding UTF8

# tsconfig.json
@'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
'@ | Out-File -FilePath "tsconfig.json" -Encoding UTF8

Write-Host "✅ Fichiers de base créés!" -ForegroundColor Green
Write-Host ""
Write-Host "Maintenant, exécutez ces commandes:" -ForegroundColor Yellow
Write-Host "1. git add ." -ForegroundColor Cyan
Write-Host "2. git commit -m 'Boutique Cloudflare'" -ForegroundColor Cyan  
Write-Host "3. git push origin main" -ForegroundColor Cyan