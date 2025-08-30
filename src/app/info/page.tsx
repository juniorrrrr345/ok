import InfoPage from '@/components/InfoPage';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
// MongoDB supprimé - utilise Cloudflare D1

// Force la revalidation de la page toutes les 10 secondes
export const revalidate = 10;

async function getInfoContent() {
  try {
    // Données par défaut en attendant l'implémentation Cloudflare
    return {
      settings: {},
      infoPage: { title: 'Informations', content: 'Bienvenue dans notre boutique !' }
    };
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
          settings={settings}
          infoPage={infoPage}
        />
        <BottomNav />
      </div>
    </div>
  );
}