import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    // Récupérer le mot de passe depuis les variables d'environnement
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    // Log pour diagnostic (à retirer en production)
    console.log('ADMIN_PASSWORD est défini:', !!adminPassword);
    console.log('Environnement:', process.env.NODE_ENV);
    console.log('Vercel env:', process.env.VERCEL_ENV);
    
    // Vérifier que la variable d'environnement est définie
    if (!adminPassword) {
      console.error('ERREUR: La variable ADMIN_PASSWORD n\'est pas définie dans les variables d\'environnement');
      return NextResponse.json({ 
        success: false, 
        message: 'Configuration serveur incorrecte. Veuillez contacter l\'administrateur.' 
      }, { status: 500 });
    }
    
    // Vérifier le mot de passe
    if (password === adminPassword) {
      return NextResponse.json({ success: true, message: 'Connexion réussie' });
    } else {
      return NextResponse.json({ success: false, message: 'Mot de passe incorrect' }, { status: 401 });
    }
  } catch (error) {
    console.error('Erreur de connexion admin:', error);
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}