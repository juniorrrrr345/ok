import { NextResponse } from 'next/server';
import d1Client from '../../../../../lib/cloudflare-d1';

// GET - Récupérer SEULEMENT les liens sociaux actifs (pour la boutique)
export async function GET() {
  try {
    // Pour la boutique : récupérer SEULEMENT les liens actifs
    const activeLinks = await d1Client.findMany('social_links', { is_active: true }, 'sort_order ASC');
    
    console.log('🌐 Liens sociaux actifs pour boutique:', activeLinks);
    
    return NextResponse.json(activeLinks || []);
  } catch (error) {
    console.error('Erreur récupération liens sociaux actifs:', error);
    return NextResponse.json([]);
  }
}