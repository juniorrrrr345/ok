'use client';

import { useCartStore } from '@/lib/cartStore';
// Removed Next Image import - using regular img for better compatibility
import { X, Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function Cart() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore();
  const [orderLink, setOrderLink] = useState('#'); // Lien de commande par défaut
  
  useEffect(() => {
    // Charger le lien de commande depuis les settings Cloudflare
    fetch('/api/cloudflare/settings')
      .then(res => res.json())
      .then(data => {
        console.log('📱 Settings reçus pour commandes:', data);
        
        // Priorité 1: whatsapp_link (colonne dédiée)
        if (data.whatsapp_link) {
          setOrderLink(data.whatsapp_link);
          console.log('📱 Lien de commande configuré:', data.whatsapp_link);
        }
        // Priorité 2: contact_info (fallback)
        else if (data.contact_info) {
          setOrderLink(data.contact_info);
          console.log('📱 Lien depuis contact_info:', data.contact_info);
        }
        // Priorité 3: ancien champ whatsappLink (compatibilité)
        else if (data.whatsappLink) {
          setOrderLink(data.whatsappLink);
          console.log('📱 Lien WhatsApp (legacy):', data.whatsappLink);
        }
      })
      .catch((error) => {
        console.error('❌ Erreur chargement settings commande:', error);
      });
  }, []);
  
  const handleSendOrder = async () => {
    if (items.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }
    
    // Calculer le total
    const total = getTotalPrice();
    
    // Construire le message pour WhatsApp (format plus simple)
    let message = `🛒 *DÉTAIL DE LA COMMANDE:*\n\n`;
    
    items.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      
      message += `${index + 1}. ${item.productName}\n`;
      message += `• Quantité: ${item.quantity}x ${item.weight}\n`;
      message += `• Prix unitaire: ${item.originalPrice}€\n`;
      message += `• Total: ${itemTotal.toFixed(2)}€\n`;
      
      if (item.discount > 0) {
        message += `• Remise: -${item.discount}%\n`;
      }
      
      message += '\n';
    });
    
    message += `💰 *TOTAL: ${total.toFixed(2)}€*\n\n`;
    message += `📍 Livraison à convenir`;
    
    // Encoder le message pour l'URL
    const encodedMessage = encodeURIComponent(message);
    
    // Construire l'URL selon le type de lien
    let finalUrl = orderLink;
    
    if (orderLink.includes('wa.me')) {
      // WhatsApp : ajouter le message
      finalUrl = `${orderLink}?text=${encodedMessage}`;
    } else if (orderLink.includes('t.me')) {
      // Telegram : ouvrir le chat
      finalUrl = orderLink;
    } else {
      // Autre lien : ouvrir tel quel
      finalUrl = orderLink;
    }
    
    console.log('📱 Ouverture lien commande:', finalUrl);
    
    // Ouvrir le lien de commande
    window.open(finalUrl, '_blank');
    
    // Afficher un message de succès
    toast.success('Redirection vers WhatsApp...');
    
    // Optionnel : vider le panier après un délai
    setTimeout(() => {
      clearCart();
      setIsOpen(false);
    }, 2000);
  };
  
  if (!isOpen) return null;
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = getTotalPrice();
  
  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Cart Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-gray-900 shadow-xl pointer-events-auto overflow-hidden">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">Mon Panier</h2>
              <span className="rounded-full bg-green-500 px-2 py-1 text-sm font-medium text-black">
                {totalItems} article{totalItems > 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ShoppingCart className="h-16 w-16 mb-4" />
                <p>Votre panier est vide</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.weight}`} className="rounded-lg bg-gray-800/50 p-4">
                    <div className="flex gap-4">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{item.productName}</h3>
                        <p className="text-sm text-gray-400">
                          {item.weight} - {item.originalPrice}€
                          {item.discount > 0 && (
                            <span className="ml-2 rounded bg-green-500/20 px-1.5 py-0.5 text-xs font-medium text-green-400">
                              -{item.discount}%
                            </span>
                          )}
                        </p>
                        <p className="mt-1 text-lg font-bold text-green-400">
                          {(item.price * item.quantity).toFixed(2)}€
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.weight, item.quantity - 1)}
                            className="rounded bg-gray-700 p-1 hover:bg-gray-600 transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.weight, item.quantity + 1)}
                            className="rounded bg-gray-700 p-1 hover:bg-gray-600 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId, item.weight)}
                          className="rounded p-1 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-800 p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-lg text-gray-400">Total:</span>
                <span className="text-2xl font-bold text-green-400">{total.toFixed(2)}€</span>
              </div>
              
              <button
                onClick={handleSendOrder}
                className="w-full rounded-lg bg-gradient-to-r from-green-500 to-green-600 py-3 font-medium text-white hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Commander
              </button>
              
              <button
                onClick={() => setIsOpen(false)}
                className="mt-3 w-full rounded-lg bg-gray-800 py-3 font-medium text-white hover:bg-gray-700 transition-colors"
              >
                Continuer les achats
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}