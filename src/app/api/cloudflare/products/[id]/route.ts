import { NextRequest, NextResponse } from 'next/server';
import d1Client from '../../../../../lib/cloudflare-d1';

// GET - Récupérer un produit par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const product = await d1Client.findOne('products', { id });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }
    
    // Enrichir avec catégorie et farm
    let category = null;
    let farm = null;
    
    if (product.category_id) {
      category = await d1Client.findOne('categories', { id: product.category_id });
    }
    
    if (product.farm_id) {
      farm = await d1Client.findOne('farms', { id: product.farm_id });
    }
    
    const enrichedProduct = {
      ...product,
      category: category?.name || null,
      farm: farm?.name || null,
      images: JSON.parse(product.images || '[]'),
      features: JSON.parse(product.features || '[]'),
      tags: JSON.parse(product.tags || '[]'),
    };
    
    return NextResponse.json(enrichedProduct);
  } catch (error) {
    console.error('Erreur récupération produit:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un produit
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    
    const {
      name,
      description,
      price,
      category,
      farm,
      image_url,
      images,
      stock,
      is_available,
      features,
      tags
    } = body;

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

    const updatedProduct = await d1Client.update('products', id, {
      name,
      description,
      price: parseFloat(price),
      category_id,
      farm_id,
      image_url,
      images: JSON.stringify(images || []),
      stock: parseInt(stock),
      is_available: Boolean(is_available),
      features: JSON.stringify(features || []),
      tags: JSON.stringify(tags || []),
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Erreur mise à jour produit:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un produit
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const success = await d1Client.delete('products', id);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Impossible de supprimer le produit' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur suppression produit:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}