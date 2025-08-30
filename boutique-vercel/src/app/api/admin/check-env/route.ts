import { NextResponse } from 'next/server';

export async function GET() {
  // Cette route est uniquement pour le débogage
  // Elle ne devrait pas être utilisée en production
  
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  return NextResponse.json({
    status: 'Configuration Admin',
    adminPasswordDefined: !!adminPassword,
    adminPasswordLength: adminPassword ? adminPassword.length : 0,
    // Ne jamais afficher le mot de passe réel, juste les premiers caractères masqués
    adminPasswordPreview: adminPassword ? `${adminPassword.substring(0, 2)}${'*'.repeat(Math.max(0, adminPassword.length - 2))}` : 'NON DÉFINI',
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    message: !adminPassword 
      ? '⚠️ ADMIN_PASSWORD n\'est pas défini. Vérifiez vos variables d\'environnement sur Vercel.' 
      : '✅ ADMIN_PASSWORD est défini correctement.'
  });
}