import { NextRequest, NextResponse } from 'next/server';
import r2Client from '../../../../lib/cloudflare-r2';

// POST - Upload d'image vers Cloudflare R2
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'images';

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP.' },
        { status: 400 }
      );
    }

    // Vérifier la taille du fichier (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux. Taille maximale: 10MB.' },
        { status: 400 }
      );
    }

    // Upload vers R2
    const imageUrl = await r2Client.uploadImage(file, folder);

    return NextResponse.json({
      success: true,
      url: imageUrl,
      secure_url: imageUrl, // Pour compatibilité avec Cloudinary
      public_id: imageUrl.split('/').pop(), // Pour compatibilité
    });

  } catch (error) {
    console.error('Erreur upload R2:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'upload' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une image de R2
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL de l\'image requise' },
        { status: 400 }
      );
    }

    // Extraire la clé de l'URL
    const key = imageUrl.split('/').slice(-2).join('/'); // ex: images/timestamp-id.jpg
    
    const success = await r2Client.deleteFile(key);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Impossible de supprimer l\'image' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erreur suppression R2:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la suppression' },
      { status: 500 }
    );
  }
}