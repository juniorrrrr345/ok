import { NextRequest, NextResponse } from 'next/server';
import d1Client from '../../../../../lib/cloudflare-d1';

// GET - Récupérer un lien social par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const socialLink = await d1Client.findOne('social_links', { id });
    
    if (!socialLink) {
      return NextResponse.json(
        { error: 'Lien social non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(socialLink);
  } catch (error) {
    console.error('Erreur récupération lien social:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un lien social
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { name, url, icon, is_active, sort_order } = body;

    const updatedSocialLink = await d1Client.update('social_links', id, {
      name,
      url,
      icon,
      is_active: Boolean(is_active),
      sort_order: parseInt(sort_order),
    });

    return NextResponse.json(updatedSocialLink);
  } catch (error) {
    console.error('Erreur mise à jour lien social:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un lien social
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const success = await d1Client.delete('social_links', id);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Impossible de supprimer le lien social' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur suppression lien social:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}