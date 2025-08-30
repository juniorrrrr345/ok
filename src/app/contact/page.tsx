import ContactPage from '@/components/ContactPage';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
// MongoDB supprimé - utilise Cloudflare D1

// Force la revalidation de la page toutes les 10 secondes
export const revalidate = 10;

async function getContactData() {
  try {
    // Données par défaut en attendant l'implémentation Cloudflare
    return {
      settings: {},
      contactPage: { title: 'Contact', content: 'Contactez-nous pour toute question.' },
      socialLinks: []
    };
  } catch (error) {
    console.error('Erreur récupération données contact:', error);
    return {
      settings: {},
      contactPage: { title: 'Contact', content: 'Contactez-nous pour toute question.' },
      socialLinks: []
    };
  }
}

export default async function ContactPageComponent() {
  const { settings, contactPage, socialLinks } = await getContactData();
  
  return (
    <div className="main-container">
      <div className="global-overlay"></div>
      <div className="content-layer">
        <Header />
        <ContactPage 
          settings={settings}
          contactPage={contactPage}
          socialLinks={socialLinks}
        />
        <BottomNav />
      </div>
    </div>
  );
}