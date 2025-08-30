import { NextResponse } from 'next/server';
import d1Client from '../../../../lib/cloudflare-d1';

// GET - Récupérer toutes les catégories
export async function GET() {
  try {
    const categories = await d1Client.getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Erreur récupération catégories:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des catégories' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle catégorie
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description = '', icon = '🏷️', color = '#3B82F6' } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Le nom de la catégorie est requis' },
        { status: 400 }
      );
    }

    const categoryData = {
      name,
      description,
      icon,
      color,
    };

    const newCategory = await d1Client.create('categories', categoryData);
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Erreur création catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la création de la catégorie' },
      { status: 500 }
    );
  }
}