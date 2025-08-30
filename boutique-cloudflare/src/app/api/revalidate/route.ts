import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json().catch(() => ({ path: null }));
    
    // Revalider toutes les pages importantes
    const paths = path ? [path] : ['/info', '/contact', '/social', '/', '/admin'];
    
    for (const p of paths) {
      revalidatePath(p);
      console.log(`✅ Revalidated: ${p}`);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Revalidated ${paths.length} paths`,
      paths 
    });
  } catch (error) {
    console.error('❌ Erreur revalidation:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    }, { status: 500 });
  }
}