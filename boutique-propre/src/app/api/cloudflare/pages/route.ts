import { NextResponse } from 'next/server';
import d1Client from '../../../../lib/cloudflare-d1';

// GET - Récupérer toutes les pages
export async function GET() {
  try {
    const pages = await d1Client.getPages();
    return NextResponse.json(pages);
  } catch (error) {
    console.error('Erreur récupération pages:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des pages' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle page
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, title, content = '', is_active = true } = body;

    if (!slug || !title) {
      return NextResponse.json(
        { error: 'Le slug et le titre sont requis' },
        { status: 400 }
      );
    }

    const pageData = {
      slug,
      title,
      content,
      is_active: Boolean(is_active),
    };

    const newPage = await d1Client.create('pages', pageData);
    return NextResponse.json(newPage, { status: 201 });
  } catch (error) {
    console.error('Erreur création page:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la création de la page' },
      { status: 500 }
    );
  }
}