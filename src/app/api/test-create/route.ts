import { NextResponse } from 'next/server';
import d1Client from '../../../lib/cloudflare-d1';

export async function GET() {
  try {
    console.log('🧪 Test création catégorie...');
    
    // Test de création d'une catégorie
    const testCategory = {
      name: `Test-${Date.now()}`,
      description: 'Catégorie de test',
      icon: '🧪',
      color: '#FF0000'
    };
    
    const result = await d1Client.create('categories', testCategory);
    
    return NextResponse.json({
      success: true,
      message: 'Test création réussi',
      result: result
    });
    
  } catch (error) {
    console.error('❌ Test création échoué:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error
    }, { status: 500 });
  }
}