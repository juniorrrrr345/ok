import { NextRequest, NextResponse } from 'next/server';
import d1Client from '../../../../lib/cloudflare-d1';

// GET - Récupérer tous les produits
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const farm = searchParams.get('farm');
    
    const filters: any = { is_available: true };
    if (category && category !== 'Toutes les catégories') {
      // Récupérer l'ID de la catégorie
      try {
        const categoryData = await d1Client.findOne('categories', { name: category });
        if (categoryData) {
          filters.category_id = categoryData.id;
        }
      } catch (e) {
        console.warn('Erreur récupération catégorie:', e);
      }
    }
    
    if (farm && farm !== 'Toutes les farms') {
      // Récupérer l'ID de la farm
      try {
        const farmData = await d1Client.findOne('farms', { name: farm });
        if (farmData) {
          filters.farm_id = farmData.id;
        }
      } catch (e) {
        console.warn('Erreur récupération farm:', e);
      }
    }

    const products = await d1Client.getProducts(filters);
    
    // Enrichir avec les noms de catégories et farms
    const enrichedProducts = await Promise.all(
      (products || []).map(async (product: any) => {
        let category = null;
        let farm = null;
        
        try {
          if (product.category_id) {
            category = await d1Client.findOne('categories', { id: product.category_id });
          }
          
          if (product.farm_id) {
            farm = await d1Client.findOne('farms', { id: product.farm_id });
          }
        } catch (e) {
          console.warn('Erreur enrichissement produit:', e);
        }
        
        // Adapter au format attendu par ProductCard
        let prices = {};
        try {
          // Essayer de parser les prix depuis la colonne prices (JSON)
          prices = JSON.parse(product.prices || '{}');
          
          // Si les prix sont vides, utiliser le prix de base
          if (Object.keys(prices).length === 0 && product.price > 0) {
            const basePrice = parseFloat(product.price);
            prices = {
              "5g": basePrice,
              "10g": Math.round(basePrice * 1.8 * 100) / 100,
              "25g": Math.round(basePrice * 4 * 100) / 100,
              "50g": Math.round(basePrice * 7 * 100) / 100,
              "100g": Math.round(basePrice * 12 * 100) / 100,
              "200g": Math.round(basePrice * 20 * 100) / 100,
            };
          }
        } catch (e) {
          console.warn('Erreur parsing prix:', e);
          prices = {
            "5g": 0,
            "10g": 0,
            "25g": 0,
            "50g": 0,
            "100g": 0,
            "200g": 0,
          };
        }

        return {
          _id: product.id?.toString() || product._id,
          name: product.name,
          description: product.description || '',
          category: category?.name || 'Sans catégorie',
          farm: farm?.name || 'Sans farm',
          image: product.image_url || '',
          video: product.video_url || '',
          prices: prices,
          images: JSON.parse(product.images || '[]'),
          features: JSON.parse(product.features || '[]'),
          tags: JSON.parse(product.tags || '[]'),
          stock: product.stock || 0,
          is_available: product.is_available !== false
        };
      })
    );

    return NextResponse.json(enrichedProducts || []);
  } catch (error) {
    console.error('Erreur récupération produits:', error);
    // Retourner un tableau vide en cas d'erreur
    return NextResponse.json([]);
  }
}

// POST - Créer un nouveau produit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description = '',
      price = 0,
      prices = {},
      category,
      farm,
      image_url = '',
      image = '',
      video_url = '',
      video = '',
      images = [],
      stock = 0,
      is_available = true,
      features = [],
      tags = []
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Le nom du produit est requis' },
        { status: 400 }
      );
    }

    // Récupérer les IDs de catégorie et farm
    let category_id = null;
    let farm_id = null;
    
    if (category) {
      const categoryData = await d1Client.findOne('categories', { name: category });
      category_id = categoryData?.id || null;
    }
    
    if (farm) {
      const farmData = await d1Client.findOne('farms', { name: farm });
      farm_id = farmData?.id || null;
    }

    // Utiliser image ou image_url selon ce qui est fourni
    const finalImageUrl = image_url || image || '';
    const finalVideoUrl = video_url || video || '';
    
    // Gérer les prix par quantité
    let finalPrices = {};
    if (Object.keys(prices).length > 0) {
      finalPrices = prices;
    } else if (price > 0) {
      // Créer les prix par quantité basés sur le prix de base
      const basePrice = parseFloat(price);
      finalPrices = {
        "5g": basePrice,
        "10g": Math.round(basePrice * 1.8 * 100) / 100,
        "25g": Math.round(basePrice * 4 * 100) / 100,
        "50g": Math.round(basePrice * 7 * 100) / 100,
        "100g": Math.round(basePrice * 12 * 100) / 100,
        "200g": Math.round(basePrice * 20 * 100) / 100,
      };
    }

    const productData = {
      name,
      description,
      price: parseFloat(price),
      prices: JSON.stringify(finalPrices),
      category_id,
      farm_id,
      image_url: finalImageUrl,
      video_url: finalVideoUrl,
      images: JSON.stringify(images),
      stock: parseInt(stock),
      is_available: Boolean(is_available),
      features: JSON.stringify(features),
      tags: JSON.stringify(tags),
    };

    const newProduct = await d1Client.create('products', productData);
    
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Erreur création produit:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la création du produit' },
      { status: 500 }
    );
  }
}