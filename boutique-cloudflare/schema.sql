-- Schéma de base de données D1 pour la boutique

-- Table des produits
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT,
    image_url TEXT,
    stock INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des catégories
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des commandes
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    user_name TEXT,
    user_phone TEXT,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    shipping_address TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des articles de commande
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Table des utilisateurs (pour le bot Telegram)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id TEXT UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    language_code TEXT DEFAULT 'fr',
    is_admin BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table de configuration du bot
CREATE TABLE IF NOT EXISTS bot_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    type TEXT DEFAULT 'string',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des messages du bot
CREATE TABLE IF NOT EXISTS bot_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    message_fr TEXT,
    message_en TEXT,
    message_ar TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des réseaux sociaux
CREATE TABLE IF NOT EXISTS social_networks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    emoji TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);

-- Données initiales de configuration
INSERT OR IGNORE INTO bot_config (key, value, type) VALUES 
    ('welcome_message', '🛍️ Bienvenue dans notre boutique {firstname}!\n\nDécouvrez nos produits exceptionnels.', 'text'),
    ('shop_name', 'Boutique Cloudflare', 'string'),
    ('currency', 'EUR', 'string'),
    ('delivery_fee', '5.00', 'number'),
    ('min_order_amount', '20.00', 'number'),
    ('shop_url', 'https://boutique.example.com', 'url'),
    ('support_phone', '+33 1 23 45 67 89', 'phone'),
    ('support_email', 'support@boutique.com', 'email');

-- Données initiales pour les réseaux sociaux
INSERT OR IGNORE INTO social_networks (name, url, emoji, display_order) VALUES 
    ('Instagram', 'https://instagram.com/boutique', '📷', 1),
    ('Facebook', 'https://facebook.com/boutique', '👍', 2),
    ('Twitter', 'https://twitter.com/boutique', '🐦', 3),
    ('TikTok', 'https://tiktok.com/@boutique', '🎵', 4),
    ('WhatsApp', 'https://wa.me/33123456789', '💬', 5);

-- Catégories par défaut
INSERT OR IGNORE INTO categories (name, description, display_order) VALUES 
    ('Électronique', 'Gadgets et appareils électroniques', 1),
    ('Mode', 'Vêtements et accessoires', 2),
    ('Maison', 'Décoration et articles pour la maison', 3),
    ('Sport', 'Équipement sportif et fitness', 4),
    ('Beauté', 'Produits de beauté et soins', 5);