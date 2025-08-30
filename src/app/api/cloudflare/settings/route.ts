import { NextRequest, NextResponse } from 'next/server';
import d1Client from '../../../../lib/cloudflare-d1';

// GET - Récupérer les paramètres
export async function GET() {
  try {
    let settings = await d1Client.getSettings();
    
    // Si aucun paramètre n'existe, créer les paramètres par défaut
    if (!settings) {
      const defaultSettings = {
        id: 1,
        shop_name: 'Ma Boutique',
        admin_password: 'admin123',
        background_image: '',
        background_opacity: 20,
        background_blur: 5,
        theme_color: '#000000',
        contact_info: '',
        shop_description: '',
        loading_enabled: true,
        loading_duration: 3000,
      };
      
      settings = await d1Client.create('settings', defaultSettings);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Erreur récupération paramètres:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des paramètres' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour les paramètres
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Valider les données
    const allowedFields = [
      'shop_name',
      'admin_password',
      'background_image',
      'background_opacity',
      'background_blur',
      'theme_color',
      'contact_info',
      'shop_description',
      'loading_enabled',
      'loading_duration'
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Aucune donnée à mettre à jour' },
        { status: 400 }
      );
    }

    const updatedSettings = await d1Client.updateSettings(updateData);
    
    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Erreur mise à jour paramètres:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour des paramètres' },
      { status: 500 }
    );
  }
}