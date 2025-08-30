// Configuration pour Cloudflare D1 et KV
// Remplace config.js qui utilisait MongoDB

class CloudflareConfig {
    constructor(env) {
        this.db = env.DB; // D1 Database
        this.kv = env.CONFIG; // KV Namespace pour la configuration
        this.cache = env.CACHE; // KV pour le cache
    }

    // Configuration par défaut
    defaultConfig = {
        botId: 'main',
        welcomeMessage: "🤖 Bienvenue {firstname} sur notre bot!\n\nUtilisez les boutons ci-dessous pour naviguer.",
        welcomeImage: null,
        infoText: "ℹ️ Informations\n\nCeci est la section d'informations du bot.",
        miniApp: {
            url: null,
            text: "🎮 Mini Application"
        },
        socialNetworks: [
            { name: "Twitter", url: "https://twitter.com", emoji: "🐦" },
            { name: "Instagram", url: "https://instagram.com", emoji: "📷" },
            { name: "Facebook", url: "https://facebook.com", emoji: "👍" }
        ],
        socialButtonsPerRow: 3
    };

    // Charger la configuration depuis D1
    async loadConfig() {
        try {
            console.log('📖 Chargement de la configuration depuis D1...');
            
            // Récupérer depuis la base de données D1
            const result = await this.db.prepare(
                'SELECT * FROM bot_config WHERE bot_id = ? LIMIT 1'
            ).bind('main').first();
            
            if (!result) {
                console.log('⚠️ Aucune configuration trouvée, création de la configuration par défaut...');
                await this.saveConfig(this.defaultConfig);
                return this.defaultConfig;
            }
            
            // Récupérer les réseaux sociaux
            const { results: socialNetworks } = await this.db.prepare(
                'SELECT * FROM social_networks WHERE is_active = 1 ORDER BY display_order'
            ).all();
            
            const config = {
                botId: result.bot_id,
                welcomeMessage: result.welcome_message,
                welcomeImage: result.welcome_image,
                infoText: result.info_text,
                miniApp: {
                    url: result.mini_app_url,
                    text: result.mini_app_text || "🎮 Mini Application"
                },
                socialNetworks: socialNetworks.map(sn => ({
                    name: sn.name,
                    url: sn.url,
                    emoji: sn.emoji
                })),
                socialButtonsPerRow: result.social_buttons_per_row || 3
            };
            
            // Mettre en cache dans KV pour un accès plus rapide
            await this.kv.put('bot_config', JSON.stringify(config), {
                expirationTtl: 3600 // Cache pour 1 heure
            });
            
            console.log('✅ Configuration chargée depuis D1');
            return config;
        } catch (error) {
            console.error('❌ Erreur lors du chargement de la configuration:', error);
            
            // Essayer de récupérer depuis le cache KV
            const cached = await this.kv.get('bot_config', { type: 'json' });
            if (cached) {
                console.log('📦 Configuration chargée depuis le cache KV');
                return cached;
            }
            
            return this.defaultConfig;
        }
    }

    // Sauvegarder la configuration dans D1
    async saveConfig(configData) {
        try {
            console.log('💾 Sauvegarde de la configuration dans D1...');
            
            // Sauvegarder dans D1
            await this.db.prepare(`
                INSERT OR REPLACE INTO bot_config 
                (bot_id, welcome_message, welcome_image, info_text, mini_app_url, mini_app_text, social_buttons_per_row, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `).bind(
                'main',
                configData.welcomeMessage,
                configData.welcomeImage,
                configData.infoText,
                configData.miniApp?.url,
                configData.miniApp?.text,
                configData.socialButtonsPerRow || 3
            ).run();
            
            // Sauvegarder les réseaux sociaux
            if (configData.socialNetworks && configData.socialNetworks.length > 0) {
                // Supprimer les anciens
                await this.db.prepare('DELETE FROM social_networks').run();
                
                // Insérer les nouveaux
                for (let i = 0; i < configData.socialNetworks.length; i++) {
                    const sn = configData.socialNetworks[i];
                    await this.db.prepare(`
                        INSERT INTO social_networks (name, url, emoji, display_order)
                        VALUES (?, ?, ?, ?)
                    `).bind(sn.name, sn.url, sn.emoji, i + 1).run();
                }
            }
            
            // Mettre à jour le cache KV
            await this.kv.put('bot_config', JSON.stringify(configData), {
                expirationTtl: 3600
            });
            
            console.log('✅ Configuration sauvegardée avec succès');
            return true;
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde de la configuration:', error);
            return false;
        }
    }

    // Réinitialiser la configuration
    async resetConfig() {
        try {
            await this.db.prepare('DELETE FROM bot_config WHERE bot_id = ?').bind('main').run();
            await this.kv.delete('bot_config');
            await this.saveConfig(this.defaultConfig);
            console.log('🔄 Configuration réinitialisée');
            return this.defaultConfig;
        } catch (error) {
            console.error('❌ Erreur lors de la réinitialisation:', error);
            return this.defaultConfig;
        }
    }

    // Obtenir l'URL d'une image (stockée dans R2 ou Cloudflare Images)
    getImagePath(imageUrl) {
        return imageUrl; // Retourne directement l'URL
    }
}

module.exports = CloudflareConfig;