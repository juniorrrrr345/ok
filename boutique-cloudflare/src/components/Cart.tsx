'use client'

import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import toast from 'react-hot-toast'

interface CartProps {
  isOpen: boolean
  onClose: () => void
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const { cart, updateQuantity, removeFromCart, clearCart } = useStore()

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const deliveryFee = subtotal > 50 ? 0 : 5
  const total = subtotal + deliveryFee

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Votre panier est vide')
      return
    }
    
    // Ici, vous pouvez rediriger vers une page de checkout ou ouvrir un modal
    toast.success('Redirection vers le paiement...')
    // Pour l'intégration Telegram, vous pouvez envoyer les données au bot
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Cart Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold flex items-center">
              <ShoppingBag className="mr-2" size={24} />
              Mon Panier ({cart.length})
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="mx-auto text-gray-400 mb-4" size={64} />
                <p className="text-gray-500">Votre panier est vide</p>
                <button
                  onClick={onClose}
                  className="mt-4 btn-primary"
                >
                  Continuer mes achats
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="text-gray-400" size={24} />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                      <p className="text-primary-600 font-bold">{item.price.toFixed(2)}€</p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="mx-3 font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => {
                        removeFromCart(item.id)
                        toast.success('Produit retiré du panier')
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                {/* Clear Cart Button */}
                <button
                  onClick={() => {
                    clearCart()
                    toast.success('Panier vidé')
                  }}
                  className="w-full py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm"
                >
                  Vider le panier
                </button>
              </div>
            )}
          </div>

          {/* Footer with Totals */}
          {cart.length > 0 && (
            <div className="border-t p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span>Sous-total</span>
                <span>{subtotal.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Livraison</span>
                <span className={deliveryFee === 0 ? 'text-green-600' : ''}>
                  {deliveryFee === 0 ? 'Gratuite' : `${deliveryFee.toFixed(2)}€`}
                </span>
              </div>
              {subtotal < 50 && (
                <p className="text-xs text-gray-500">
                  Livraison gratuite à partir de 50€
                </p>
              )}
              <div className="flex justify-between font-bold text-lg pt-3 border-t">
                <span>Total</span>
                <span className="text-primary-600">{total.toFixed(2)}€</span>
              </div>
              
              <button
                onClick={handleCheckout}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <ShoppingBag size={20} />
                <span>Passer la commande</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}