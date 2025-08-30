import { NextRequest, NextResponse } from 'next/server';
import d1Client from '../../../../../lib/cloudflare-d1';

// GET - Récupérer une farm par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const farm = await d1Client.findOne('farms', { id });
    
    if (!farm) {
      return NextResponse.json(
        { error: 'Farm non trouvée' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(farm);
  } catch (error) {
    console.error('Erreur récupération farm:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une farm
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { name, description, location, contact } = body;

    const updatedFarm = await d1Client.update('farms', id, {
      name,
      description,
      location,
      contact,
    });

    return NextResponse.json(updatedFarm);
  } catch (error) {
    console.error('Erreur mise à jour farm:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une farm
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const success = await d1Client.delete('farms', id);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Impossible de supprimer la farm' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur suppression farm:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}