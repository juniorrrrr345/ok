import { NextRequest, NextResponse } from 'next/server';
import d1Client from '../../../../../lib/cloudflare-d1';

// GET - Récupérer une page par slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const page = await d1Client.findOne('pages', { slug: params.slug });
    
    if (!page) {
      return NextResponse.json(
        { error: 'Page non trouvée' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(page);
  } catch (error) {
    console.error('Erreur récupération page:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une page
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const { slug, title, content, is_active = true } = body;
    
    console.log('📝 PUT Page:', { slug: params.slug, title, content });

    // Trouver la page par slug d'abord
    let existingPage = await d1Client.findOne('pages', { slug: params.slug });
    
    if (!existingPage) {
      console.log('📄 Page non trouvée, création...');
      // Créer la page si elle n'existe pas
      const newPage = await d1Client.create('pages', {
        slug: params.slug,
        title,
        content,
        is_active: Boolean(is_active)
      });
      
      console.log('✅ Page créée:', newPage);
      return NextResponse.json({ success: true, data: newPage });
    }

    const updatedPage = await d1Client.update('pages', existingPage.id, {
      title,
      content,
      is_active: Boolean(is_active),
    });

    console.log('✅ Page mise à jour:', updatedPage);
    return NextResponse.json({ success: true, data: updatedPage });
  } catch (error) {
    console.error('❌ Erreur mise à jour page:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une page
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Trouver la page par slug d'abord
    const existingPage = await d1Client.findOne('pages', { slug: params.slug });
    
    if (!existingPage) {
      return NextResponse.json(
        { error: 'Page non trouvée' },
        { status: 404 }
      );
    }
    
    const success = await d1Client.delete('pages', existingPage.id);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Impossible de supprimer la page' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur suppression page:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}