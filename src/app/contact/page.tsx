import ContactPage from '@/components/ContactPage';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
// MongoDB supprimé - utilise Cloudflare D1

// Force la revalidation de la page toutes les 10 secondes
export const revalidate = 10;

async function getContactData() {
  try {
    // Récupérer depuis Cloudflare D1 via les API
    const [settingsRes, pageRes, socialRes] = await Promise.allSettled([
      fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/cloudflare/settings`, { cache: 'no-store' }),
      fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/cloudflare/pages/contact`, { cache: 'no-store' }),
      fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/cloudflare/social-links`, { cache: 'no-store' })
    ]);

    const settings = settingsRes.status === 'fulfilled' && settingsRes.value.ok 
      ? await settingsRes.value.json() 
      : {};

    const contactPage = pageRes.status === 'fulfilled' && pageRes.value.ok 
      ? await pageRes.value.json() 
      : { title: 'Contact', content: 'Contactez-nous pour toute question.' };

    const socialLinks = socialRes.status === 'fulfilled' && socialRes.value.ok 
      ? await socialRes.value.json() 
      : [];

    return { settings, contactPage, socialLinks };
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