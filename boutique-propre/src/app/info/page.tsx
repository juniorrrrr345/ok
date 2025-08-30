import InfoPage from '@/components/InfoPage';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
// MongoDB supprimé - utilise Cloudflare D1

// Force la revalidation de la page toutes les 10 secondes
export const revalidate = 10;

async function getInfoContent() {
  try {
    // Récupérer depuis Cloudflare D1 via les API
    const [settingsRes, pageRes] = await Promise.allSettled([
      fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/cloudflare/settings`, { cache: 'no-store' }),
      fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/cloudflare/pages/info`, { cache: 'no-store' })
    ]);

    const settings = settingsRes.status === 'fulfilled' && settingsRes.value.ok 
      ? await settingsRes.value.json() 
      : {};

    const infoPage = pageRes.status === 'fulfilled' && pageRes.value.ok 
      ? await pageRes.value.json() 
      : { title: 'Informations', content: 'Bienvenue dans notre boutique !' };

    return { settings, infoPage };
  } catch (error) {
    console.error('Erreur récupération contenu info:', error);
    return {
      settings: {},
      infoPage: { title: 'Informations', content: 'Bienvenue dans notre boutique !' }
    };
  }
}

export default async function InfoPageComponent() {
  const { settings, infoPage } = await getInfoContent();
  
  return (
    <div className="main-container">
      <div className="global-overlay"></div>
      <div className="content-layer">
        <Header />
        <InfoPage 
          content={infoPage?.content || 'Aucun contenu disponible'}
        />
        <BottomNav />
      </div>
    </div>
  );
}