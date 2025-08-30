import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
// MongoDB supprimé - utilise Cloudflare D1

// Force la revalidation de la page toutes les 10 secondes
export const revalidate = 10;

interface SocialLink {
  _id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
  isActive: boolean;
}

interface Settings {
  shopTitle: string;
  shopSubtitle: string;
  email: string;
  address: string;
  whatsappLink: string;
}

async function getSocialData() {
  try {
    // Récupérer SEULEMENT les liens actifs pour la boutique
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ok-git-main-lucas-projects-34f60a70.vercel.app';
    
    const [socialRes, settingsRes] = await Promise.allSettled([
      fetch(`${baseUrl}/api/cloudflare/social-links`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/cloudflare/settings`, { cache: 'no-store' })
    ]);

    console.log('📡 Réponses API social:', {
      socialStatus: socialRes.status,
      settingsStatus: settingsRes.status
    });

    const socialLinks = socialRes.status === 'fulfilled' && socialRes.value.ok 
      ? await socialRes.value.json() 
      : [];

    const settings = settingsRes.status === 'fulfilled' && settingsRes.value.ok 
      ? await settingsRes.value.json() 
      : null;

    console.log('🌐 Liens sociaux bruts depuis API:', socialLinks);

    // Si pas de liens, retourner tableau vide (pas de données par défaut)
    if (!socialLinks || socialLinks.length === 0) {
      console.log('🌐 Aucun lien social configuré');
      return {
        socialLinks: [],
        settings: settings ? {
          shopTitle: settings.shop_name || 'CALITEK',
          whatsappLink: settings.whatsapp_link || settings.contact_info || '#',
          email: settings.contact_info || '',
          address: settings.shop_description || '',
        } : null
      };
    }

    // Mapper les données D1 vers le format attendu par la page
    const mappedLinks = socialLinks.map((link: any) => ({
      _id: link.id?.toString() || link._id,
      name: link.name,
      url: link.url,
      icon: link.icon || '🔗',
      color: link.color || '#3B82F6',
      isActive: true, // Toujours actif maintenant
      order: link.sort_order || 0
    }));

    console.log('🌐 Liens sociaux mappés:', mappedLinks);

    const mappedSettings = settings ? {
      shopTitle: settings.shop_name || 'CALITEK',
      whatsappLink: settings.whatsapp_link || settings.contact_info || '#',
      email: settings.contact_info || '',
      address: settings.shop_description || '',
    } : null;
    
    return {
      socialLinks: mappedLinks as SocialLink[],
      settings: mappedSettings as Settings | null
    };
  } catch (error) {
    console.error('Erreur chargement social:', error);
    return {
      socialLinks: [], // Tableau vide en cas d'erreur
      settings: null
    };
  }
}

export default async function SocialPage() {
  // Charger les données côté serveur
  const { socialLinks, settings } = await getSocialData();

  // Structure cohérente avec la boutique principale
  return (
    <div className="main-container">
      {/* Overlay global toujours présent */}
      <div className="global-overlay"></div>
      
      {/* Contenu principal */}
      <div className="content-layer">
        <Header />
        
        <div className="pt-32 sm:pt-36 md:pt-40">
          <main className="pt-4 pb-24 sm:pb-28 px-3 sm:px-4 lg:px-6 xl:px-8 max-w-7xl mx-auto">
            {/* Titre de la page avec style boutique */}
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="shop-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3">
                Nos Réseaux
              </h1>
              <div className="w-20 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-4"></div>
              <p className="text-white text-base sm:text-lg max-w-xl mx-auto px-4 font-semibold bg-black/50 backdrop-blur-sm py-2 px-4 rounded-lg">
                Rejoignez <span className="text-yellow-400">{settings?.shopTitle || 'CALITEK'}</span> sur nos réseaux sociaux
              </p>
            </div>

            {socialLinks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {socialLinks.map((link) => (
                  <a
                    key={link._id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative overflow-hidden rounded-xl transition-all duration-300 transform hover:scale-105 bg-gray-900/50 backdrop-blur-sm border border-white/10 hover:border-white/20"
                  >
                    {/* Effet de hover */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${link.color}, transparent)`
                      }}
                    />
                    
                    <div className="relative p-4 sm:p-6 text-center">
                      {/* Icône */}
                      <div className="text-2xl sm:text-3xl mb-2">{link.icon}</div>
                      
                      {/* Nom du réseau */}
                      <h3 className="text-sm sm:text-base font-semibold text-white mb-2 truncate">
                        {link.name}
                      </h3>
                      
                      {/* Petit indicateur de couleur */}
                      <div 
                        className="w-8 h-1 mx-auto rounded-full"
                        style={{ backgroundColor: link.color }}
                      />
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-400">
                  Aucun réseau social configuré pour le moment.
                </p>
              </div>
            )}


          </main>
        </div>
      </div>
      
      {/* BottomNav toujours visible */}
      <BottomNav />
    </div>
  );
}