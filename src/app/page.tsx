'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
// Redéploiement forcé - Nouveau chargement FULL OPTION IDF
import CategoryFilter from '../components/CategoryFilter';
import ProductCard, { Product } from '../components/ProductCard';
import ProductDetail from '../components/ProductDetail';
import BottomNav from '../components/BottomNav';
import contentCache from '../lib/contentCache';
export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('Toutes les catégories');
  const [selectedFarm, setSelectedFarm] = useState('Toutes les farms');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('menu');
  const router = useRouter();
  
  // Précharger les autres pages pour navigation instantanée
  useEffect(() => {
    router.prefetch('/info');
    router.prefetch('/contact');
    router.prefetch('/social');
  }, [router]);
  
  // États pour les données - Initialiser avec des valeurs par défaut
  const [loading, setLoading] = useState(true); // Toujours true au départ
  
  // Gérer la logique de première visite côté client uniquement
  useEffect(() => {
    // Vérifier si c'est la première visite
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (hasVisited) {
      // Si déjà visité, cacher le chargement immédiatement
      setLoading(false);
    } else {
      // Si première visite, marquer comme visité
      sessionStorage.setItem('hasVisited', 'true');
    }
  }, []); // Ne s'exécute qu'une fois au montage
  
  // Charger le thème depuis l'API au démarrage
  useEffect(() => {
    const loadThemeForNewVisitors = async () => {
      try {
        // Charger les paramètres depuis l'API pour les nouveaux visiteurs
        const settingsRes = await fetch('/api/settings', { cache: 'no-store' });
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          
          // Sauvegarder dans localStorage pour les prochaines visites
          localStorage.setItem('shopSettings', JSON.stringify(settings));
          
          // Appliquer le thème immédiatement
          if (settings.backgroundImage) {
            const style = document.createElement('style');
            style.id = 'dynamic-theme-new-visitor';
            style.textContent = `
              html, body, .main-container {
                background-image: url(${settings.backgroundImage}) !important;
                background-size: cover !important;
                background-position: center !important;
                background-repeat: no-repeat !important;
                background-attachment: fixed !important;
              }
              .global-overlay {
                background-color: rgba(0, 0, 0, ${(settings.backgroundOpacity || 20) / 100}) !important;
                backdrop-filter: blur(${settings.backgroundBlur || 5}px) !important;
              }
            `;
            document.head.appendChild(style);
          }
        }
      } catch (error) {
        console.error('Erreur chargement thème:', error);
      }
    };
    
    // Charger le thème immédiatement pour les nouveaux visiteurs
    if (!localStorage.getItem('shopSettings')) {
      loadThemeForNewVisitors();
    }
  }, []);

  // Charger immédiatement depuis l'API - PAS depuis localStorage
  const getInitialProducts = () => {
    // Toujours retourner un tableau vide pour forcer le chargement depuis l'API
    return [];
  };
  
  const getInitialCategories = () => {
    // Toujours retourner les catégories par défaut pour forcer le chargement depuis l'API
    return ['Toutes les catégories'];
  };
  
  const getInitialFarms = () => {
    // Toujours retourner les farms par défaut pour forcer le chargement depuis l'API
    return ['Toutes les farms'];
  };
  
  const [products, setProducts] = useState<Product[]>(getInitialProducts());
  const [categories, setCategories] = useState<string[]>(getInitialCategories());
  const [farms, setFarms] = useState<string[]>(getInitialFarms());

  // CHARGEMENT INSTANTANÉ DEPUIS LE CACHE
  useEffect(() => {
    // 1. D'abord charger depuis le cache pour affichage immédiat
    const cachedProducts = contentCache.getProducts();
    const cachedCategories = contentCache.getCategories();
    const cachedFarms = contentCache.getFarms();
    
    if (cachedProducts.length > 0) {
      setProducts(cachedProducts);
    }
    if (cachedCategories.length > 0) {
      setCategories(['Toutes les catégories', ...cachedCategories.map((c: any) => c.name)]);
    }
    if (cachedFarms.length > 0) {
      setFarms(['Toutes les farms', ...cachedFarms.map((f: any) => f.name)]);
    }
    
    // 2. Charger les données fraîches en arrière-plan
    const loadFreshData = async () => {
      try {
        const [productsRes, categoriesRes, farmsRes] = await Promise.all([
          fetch('/api/products', { cache: 'no-store' }),
          fetch('/api/categories', { cache: 'no-store' }),
          fetch('/api/farms', { cache: 'no-store' })
        ]);

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData);
          contentCache.updateProducts(productsData);
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(['Toutes les catégories', ...categoriesData.map((c: any) => c.name)]);
          contentCache.updateCategories(categoriesData);
        }

        if (farmsRes.ok) {
          const farmsData = await farmsRes.json();
          setFarms(['Toutes les farms', ...farmsData.map((f: any) => f.name)]);
          contentCache.updateFarms(farmsData);
        }
      } catch (error) {
        console.error('Erreur chargement données fraîches:', error);
      }
    };
    
    loadFreshData();
    
    // Cacher le chargement après un délai plus long pour être sûr qu'il soit visible
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 7000); // 7 secondes pour bien voir le chargement
    
    // Rafraîchir les données toutes les secondes pour synchronisation temps réel
    const interval = setInterval(() => {
      loadFreshData();
    }, 1000); // 1 seconde pour synchronisation instantanée
    
    // Écouter les changements de paramètres
    
    return () => {
      clearTimeout(loadingTimeout);
      clearInterval(interval);
    };
  }, []);

  // Écouter les mises à jour du cache
  useEffect(() => {
    const handleCacheUpdate = (event: CustomEvent) => {
      const { products: newProducts, categories: newCategories, farms: newFarms } = event.detail;
      
      if (newProducts) {
        setProducts(newProducts);
      }
      
      if (newCategories) {
        setCategories(['Toutes les catégories', ...newCategories.map((c: any) => c.name)]);
      }
      
      if (newFarms) {
        setFarms(['Toutes les farms', ...newFarms.map((f: any) => f.name)]);
      }
    };
    
    window.addEventListener('cacheUpdated', handleCacheUpdate as EventListener);
    
    return () => {
      window.removeEventListener('cacheUpdated', handleCacheUpdate as EventListener);
    };
  }, []);

  // Filtrage des produits
  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'Toutes les catégories' || product.category === selectedCategory;
    const farmMatch = selectedFarm === 'Toutes les farms' || product.farm === selectedFarm;
    return categoryMatch && farmMatch;
  });

  const handleTabChange = (tabId: string) => {
    if (tabId === 'social') {
      router.push('/social');
    } else if (tabId === 'infos') {
      router.push('/info');
    } else if (tabId === 'contact') {
      router.push('/contact');
    } else {
      setActiveTab(tabId);
      if (tabId === 'menu') {
        setSelectedProduct(null);
      }
    }
  };

  // Écran de chargement avec fond de thème de la boutique
  if (loading) {
    return (
      <div className="main-container">
        <div className="global-overlay"></div>
        <div className="content-layer">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center bg-black/60 backdrop-blur-md rounded-3xl p-8 sm:p-12 max-w-lg mx-auto border border-white/20">

              
              {/* Logo transparent sans contour */}
              <div className="mb-8">
                <img 
                  src="https://i.imgur.com/mNencn1.png" 
                  alt="FULL OPTION IDF" 
                  className="h-32 sm:h-40 md:h-48 w-auto mx-auto"
                  style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))' }}
                />
              </div>
              
              <p className="text-2xl text-white mb-8 font-semibold drop-shadow-lg animate-pulse">
                FULL OPTION IDF
              </p>
              
              {/* Nouvelle barre de chargement style néon */}
              <div className="w-80 max-w-full mx-auto mb-8">
                <div className="h-4 bg-black/50 rounded-full overflow-hidden border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                  <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg animate-loading-bar relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                  </div>
                </div>
                <div className="mt-2 text-sm text-blue-300 font-medium drop-shadow-md animate-pulse">Chargement en cours...</div>
              </div>
              
              {/* Animation de particules style diamant */}
              <div className="flex justify-center gap-3 mb-8">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce shadow-[0_0_10px_rgba(96,165,250,0.8)]" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce shadow-[0_0_10px_rgba(168,85,247,0.8)]" style={{ animationDelay: '200ms' }}></div>
                <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce shadow-[0_0_10px_rgba(236,72,153,0.8)]" style={{ animationDelay: '400ms' }}></div>
              </div>
              
              {/* Footer */}
              <div className="text-white text-sm font-medium drop-shadow-md">
                <p>© 2025 FULL OPTION IDF</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }





  // Structure avec fond toujours visible
  return (
    <div className="main-container">
      {/* Overlay global toujours présent */}
      <div className="global-overlay"></div>
      
      {/* Contenu principal avec navigation */}
      <div className="content-layer">
        <Header />
        
        {/* Ajouter un padding-top pour compenser le header fixe */}
        <div className="pt-24 sm:pt-28 md:pt-32">
            {selectedProduct ? (
              <ProductDetail 
                product={selectedProduct} 
                onClose={() => setSelectedProduct(null)} 
              />
            ) : (
              <div className="pt-2">
                <CategoryFilter
                  categories={categories}
                  farms={farms}
                  selectedCategory={selectedCategory}
                  selectedFarm={selectedFarm}
                  onCategoryChange={setSelectedCategory}
                  onFarmChange={setSelectedFarm}
                />
                
                <main className="pt-3 pb-24 sm:pb-28 px-3 sm:px-4 lg:px-6 xl:px-8 max-w-7xl mx-auto">

                {/* Affichage des produits */}
                {filteredProducts.length === 0 && products.length > 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <p className="text-white/60 text-base sm:text-lg">
                      Aucun produit ne correspond à vos critères de recherche
                    </p>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        onClick={() => setSelectedProduct(product)}
                      />
                    ))}
                  </div>
                ) : null}
                </main>
              </div>
            )}
        </div>
      </div>
      
      {/* BottomNav toujours visible - en dehors du content-layer */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}