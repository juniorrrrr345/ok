import { NextResponse } from 'next/server';
import d1Client from '../../../../lib/cloudflare-d1';

// GET - Récupérer toutes les farms
export async function GET() {
  try {
    const farms = await d1Client.getFarms();
    return NextResponse.json(farms);
  } catch (error) {
    console.error('Erreur récupération farms:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des farms' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle farm
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description = '', location = '', contact = '' } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Le nom de la farm est requis' },
        { status: 400 }
      );
    }

    const farmData = {
      name,
      description,
      location,
      contact,
    };

    const newFarm = await d1Client.create('farms', farmData);
    return NextResponse.json(newFarm, { status: 201 });
  } catch (error) {
    console.error('Erreur création farm:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la création de la farm' },
      { status: 500 }
    );
  }
}