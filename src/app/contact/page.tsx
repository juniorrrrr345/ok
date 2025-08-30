import ContactPage from '@/components/ContactPage';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { connectToDatabase } from '@/lib/mongodb-fixed';

// Force la revalidation de la page toutes les 10 secondes
export const revalidate = 10;

async function getContactData() {
  try {
    const { db } = await connectToDatabase();
    
    const [page, settings, socialLinks] = await Promise.all([
      db.collection('pages').findOne({ slug: 'contact' }),
      db.collection('settings').findOne({}),
      db.collection('socialLinks').find({ isActive: true }).toArray()
    ]);
    
    console.log('Page contact trouvée:', page ? 'Oui' : 'Non');
    console.log('Réseaux sociaux trouvés:', socialLinks.length);
    
    // Si la page n'existe pas, la créer
    if (!page) {
      await db.collection('pages').insertOne({
        slug: 'contact',
        title: 'Contact',
        content: '# Contactez FULL OPTION IDF\n\nNous sommes à votre disposition pour répondre à toutes vos questions.\n\nModifiez ce contenu depuis le panel d\'administration.',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return {
      content: page?.content || '# Contactez FULL OPTION IDF\n\nNous sommes à votre disposition pour répondre à toutes vos questions.',
      whatsappLink: settings?.whatsappLink || '',
      socialLinks: socialLinks || []
    };
  } catch (error) {
    console.error('Erreur chargement contact:', error);
    return {
      content: '',
      whatsappLink: '',
      socialLinks: []
    };
  }
}

export default async function ContactPageRoute() {
  // Charger les données côté serveur
  const { content, whatsappLink, socialLinks } = await getContactData();

  return (
    <div className="main-container">
      {/* Overlay global toujours présent */}
      <div className="global-overlay"></div>
      
      {/* Contenu principal */}
      <div className="content-layer">
        <Header />
        <div className="pt-12 sm:pt-14">
          <div className="h-4 sm:h-6"></div>
          <ContactPage 
            content={content}
            whatsappLink={whatsappLink}
            socialLinks={socialLinks}
          />
        </div>
      </div>
      
      {/* BottomNav */}
      <BottomNav />
    </div>
  );
}