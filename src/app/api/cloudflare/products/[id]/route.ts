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
      prices,
      category,
      farm,
      image_url,
      image,
      video_url,
      video,
      images,
      stock,
      is_available,
      features,
      tags
    } = body;

    console.log('📝 Données reçues pour mise à jour produit:', body);

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

    // Préparer les données de mise à jour avec validation
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    
    // S'assurer que price n'est jamais null/undefined
    if (price !== undefined && price !== null) {
      const numPrice = parseFloat(price);
      updateData.price = isNaN(numPrice) ? 0 : numPrice;
    }
    
    // Gérer les prix par quantité
    if (prices && Object.keys(prices).length > 0) {
      updateData.prices = JSON.stringify(prices);
    }
    
    if (category_id !== undefined) updateData.category_id = category_id;
    if (farm_id !== undefined) updateData.farm_id = farm_id;
    
    // Gérer les URLs d'images/vidéos
    const finalImageUrl = image_url || image;
    const finalVideoUrl = video_url || video;
    
    if (finalImageUrl !== undefined) updateData.image_url = finalImageUrl || '';
    if (finalVideoUrl !== undefined) updateData.video_url = finalVideoUrl || '';
    
    if (images !== undefined) updateData.images = JSON.stringify(images || []);
    if (stock !== undefined) updateData.stock = parseInt(stock) || 0;
    if (is_available !== undefined) updateData.is_available = Boolean(is_available);
    if (features !== undefined) updateData.features = JSON.stringify(features || []);
    if (tags !== undefined) updateData.tags = JSON.stringify(tags || []);

    console.log('🗄️ Données nettoyées pour D1:', updateData);

    const updatedProduct = await d1Client.update('products', id, updateData);

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