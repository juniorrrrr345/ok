import InfoPage from '@/components/InfoPage';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { connectToDatabase } from '@/lib/mongodb-fixed';

// Force la revalidation de la page toutes les 10 secondes
export const revalidate = 10;

async function getInfoContent() {
  try {
    const { db } = await connectToDatabase();
    const page = await db.collection('pages').findOne({ slug: 'info' });
    console.log('Page info trouvée:', page ? 'Oui' : 'Non');
    
    // Si la page n'existe pas, la créer
    if (!page) {
      await db.collection('pages').insertOne({
        slug: 'info',
        title: 'Informations',
        content: 'Bienvenue sur la page d\'informations de FULL OPTION IDF.\n\nModifiez ce contenu depuis le panel d\'administration.',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return 'Bienvenue sur la page d\'informations de FULL OPTION IDF.\n\nModifiez ce contenu depuis le panel d\'administration.';
    }
    
    return page.content || '';
  } catch (error) {
    console.error('Erreur chargement info:', error);
    return '';
  }
}

export default async function InfoPageRoute() {
  // Charger le contenu côté serveur
  const content = await getInfoContent();

  return (
    <div className="main-container">
      {/* Overlay global toujours présent */}
      <div className="global-overlay"></div>
      
      {/* Contenu principal */}
      <div className="content-layer">
        <Header />
        <div className="pt-12 sm:pt-14">
          <div className="h-4 sm:h-6"></div>
          <InfoPage content={content} />
        </div>
      </div>
      
      {/* BottomNav */}
      <BottomNav />
    </div>
  );
}