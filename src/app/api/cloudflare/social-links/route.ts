import { NextResponse } from 'next/server';
import d1Client from '../../../../lib/cloudflare-d1';

// GET - Récupérer tous les liens sociaux
export async function GET() {
  try {
    const socialLinks = await d1Client.getSocialLinks();
    return NextResponse.json(socialLinks || []);
  } catch (error) {
    console.error('Erreur récupération liens sociaux:', error);
    // Retourner des données par défaut en cas d'erreur
    return NextResponse.json([
      { id: 1, name: 'Instagram', url: '#', icon: '📷', is_active: true, sort_order: 1 },
      { id: 2, name: 'Facebook', url: '#', icon: '👍', is_active: true, sort_order: 2 },
      { id: 3, name: 'WhatsApp', url: '#', icon: '💬', is_active: true, sort_order: 3 }
    ]);
  }
}

// POST - Créer un nouveau lien social
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, url, icon = '🔗', is_active = true, sort_order = 0 } = body;

    if (!name || !url) {
      return NextResponse.json(
        { error: 'Le nom et l\'URL sont requis' },
        { status: 400 }
      );
    }

    const socialLinkData = {
      name,
      url,
      icon,
      is_active: Boolean(is_active),
      sort_order: parseInt(sort_order),
    };

    const newSocialLink = await d1Client.create('social_links', socialLinkData);
    return NextResponse.json(newSocialLink, { status: 201 });
  } catch (error) {
    console.error('Erreur création lien social:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la création du lien social' },
      { status: 500 }
    );
  }
}