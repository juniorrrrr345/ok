-- Table des produits
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  image_url TEXT,
  category_id INTEGER,
  farm_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (farm_id) REFERENCES farms(id)
);

-- Table des catégories
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des farms
CREATE TABLE IF NOT EXISTS farms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table de configuration
CREATE TABLE IF NOT EXISTS config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des images du carrousel
CREATE TABLE IF NOT EXISTS carousel_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT NOT NULL,
  title TEXT,
  order_index INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insérer des valeurs de configuration par défaut
INSERT OR IGNORE INTO config (key, value) VALUES 
  ('background_url', ''),
  ('logo_url', ''),
  ('shop_name', 'Ma Boutique'),
  ('contact_email', 'contact@maboutique.com'),
  ('contact_phone', '+33 6 00 00 00 00'),
  ('contact_address', '123 Rue de la Boutique, 75000 Paris'),
  ('info_text', 'Bienvenue dans notre boutique en ligne !'),
  ('instagram_url', ''),
  ('telegram_url', ''),
  ('facebook_url', ''),
  ('twitter_url', '');

-- Insérer des catégories par défaut
INSERT OR IGNORE INTO categories (name) VALUES 
  ('Fleurs'),
  ('Concentrés'),
  ('Edibles'),
  ('Accessoires');

-- Insérer des farms par défaut
INSERT OR IGNORE INTO farms (name) VALUES 
  ('Farm Premium'),
  ('Farm Bio'),
  ('Farm Local');