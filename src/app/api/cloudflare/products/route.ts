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
        
        return {
          ...product,
          category: category?.name || null,
          farm: farm?.name || null,
          images: JSON.parse(product.images || '[]'),
          features: JSON.parse(product.features || '[]'),
          tags: JSON.parse(product.tags || '[]'),
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
      category,
      farm,
      image_url = '',
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

    const productData = {
      name,
      description,
      price: parseFloat(price),
      category_id,
      farm_id,
      image_url,
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