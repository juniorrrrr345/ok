import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-fixed';
import Settings from '@/models/Settings';
import { CartItem } from '@/lib/cartStore';

export async function POST(request: NextRequest) {
  try {
    const { items }: { items: CartItem[] } = await request.json();
    
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Panier vide' }, { status: 400 });
    }
    
    // Récupérer le username Telegram depuis les settings
    const { db } = await connectToDatabase();
    const settings = await db.collection('settings').findOne({});
    const telegramUsername = settings?.telegramUsername;
    
    if (!telegramUsername) {
      return NextResponse.json({ error: 'Configuration Telegram manquante' }, { status: 500 });
    }
    
    // Formater la date
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Calculer le total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Construire le message
    let message = `🌿 **COMMANDE FRESHSWISS** 🌿\n\n`;
    message += `📅 Date: ${dateStr} à ${timeStr}\n`;
    message += `📱 Via: Mini-App Catalogue\n\n`;
    message += `🛒 **DÉTAIL DE LA COMMANDE:**\n\n`;
    
    items.forEach((item, index) => {
      const totalWeight = parseInt(item.weight) * item.quantity;
      const itemTotal = item.price * item.quantity;
      
      message += `${index + 1}. 🍒 ${item.productName}\n`;
      message += `   • Quantité: ${item.quantity}x ${item.weight}\n`;
      message += `   • Prix unitaire: ${item.originalPrice}€\n`;
      message += `   • Total: ${itemTotal.toFixed(2)}€\n`;
      
      if (item.discount > 0) {
        message += `   • Remise: -${item.discount}% (prix dégressif)\n`;
      }
      
      message += '\n';
    });
    
    message += `💰 **TOTAL: ${total.toFixed(2)}€**\n\n`;
    message += `📞 Merci de confirmer cette commande et les modalités de livraison/paiement.\n`;
    message += `🚚 Livraison disponible ou retrait sur place.`;
    
    // Ici, vous devrez intégrer l'API Telegram Bot pour envoyer le message
    // Pour l'instant, on simule l'envoi
    console.log('Message à envoyer:', message);
    console.log('Destinataire:', telegramUsername);
    
    // TODO: Intégrer l'API Telegram Bot
    // const botToken = process.env.TELEGRAM_BOT_TOKEN;
    // await sendTelegramMessage(telegramUsername, message);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Commande envoyée avec succès',
      orderDetails: message 
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la commande:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}