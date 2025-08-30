import { NextRequest, NextResponse } from 'next/server';
import d1Client from '../../../../lib/cloudflare-d1';

// GET - Récupérer les paramètres
export async function GET() {
  try {
    console.log('🔍 GET settings...');
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

    console.log('✅ Settings récupérés:', settings);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('❌ Erreur GET settings:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des paramètres' },
      { status: 500 }
    );
  }
}

// POST - Créer ou mettre à jour les paramètres (pour compatibilité)
export async function POST(request: NextRequest) {
  return PUT(request);
}

// PUT - Mettre à jour les paramètres
export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 PUT settings...');
    const body = await request.json();
    
    console.log('📝 Données reçues pour mise à jour:', body);

    // Créer un objet avec tous les champs possibles
    const updateData: any = {};
    
    // Mapper directement tous les champs reçus
    if (body.shopTitle !== undefined) updateData.shop_name = body.shopTitle;
    if (body.shopSubtitle !== undefined) updateData.shop_description = body.shopSubtitle;
    if (body.bannerText !== undefined) updateData.contact_info = body.bannerText;
    if (body.loadingText !== undefined) updateData.shop_description = body.loadingText;
    
    // Gérer WhatsApp dans des colonnes séparées ET contact_info pour compatibilité
    if (body.whatsappLink !== undefined) {
      updateData.whatsapp_link = body.whatsappLink;
      updateData.contact_info = body.whatsappLink; // Pour compatibilité
    }
    if (body.whatsappNumber !== undefined) {
      updateData.whatsapp_number = body.whatsappNumber;
    }
    if (body.titleStyle !== undefined) updateData.theme_color = body.titleStyle;
    if (body.backgroundImage !== undefined) updateData.background_image = body.backgroundImage;
    if (body.backgroundOpacity !== undefined) updateData.background_opacity = parseInt(body.backgroundOpacity);
    if (body.backgroundBlur !== undefined) updateData.background_blur = parseInt(body.backgroundBlur);
    if (body.scrollingText !== undefined) updateData.contact_info = body.scrollingText;

    // Champs directs
    if (body.shop_name !== undefined) updateData.shop_name = body.shop_name;
    if (body.admin_password !== undefined) updateData.admin_password = body.admin_password;
    if (body.background_image !== undefined) updateData.background_image = body.background_image;
    if (body.background_opacity !== undefined) updateData.background_opacity = body.background_opacity;
    if (body.background_blur !== undefined) updateData.background_blur = body.background_blur;
    if (body.theme_color !== undefined) updateData.theme_color = body.theme_color;
    if (body.contact_info !== undefined) updateData.contact_info = body.contact_info;
    if (body.shop_description !== undefined) updateData.shop_description = body.shop_description;
    if (body.loading_enabled !== undefined) updateData.loading_enabled = body.loading_enabled;
    if (body.loading_duration !== undefined) updateData.loading_duration = body.loading_duration;

    console.log('🗄️ Données mappées pour D1:', updateData);

    if (Object.keys(updateData).length === 0) {
      console.warn('⚠️ Aucune donnée à mettre à jour');
      return NextResponse.json(
        { error: 'Aucune donnée à mettre à jour' },
        { status: 400 }
      );
    }

    const updatedSettings = await d1Client.updateSettings(updateData);
    
    console.log('✅ Settings mis à jour:', updatedSettings);
    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('❌ Erreur PUT settings:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour des paramètres', details: error.message },
      { status: 500 }
    );
  }
}