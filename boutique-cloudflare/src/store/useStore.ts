import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image_url?: string
}

interface Store {
  cart: CartItem[]
  favorites: number[]
  addToCart: (product: any) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  toggleFavorite: (productId: number) => void
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      cart: [],
      favorites: [],
      
      addToCart: (product) => set((state) => {
        const existingItem = state.cart.find(item => item.id === product.id)
        
        if (existingItem) {
          return {
            cart: state.cart.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          }
        }
        
        return {
          cart: [...state.cart, {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image_url: product.image_url
          }]
        }
      }),
      
      removeFromCart: (productId) => set((state) => ({
        cart: state.cart.filter(item => item.id !== productId)
      })),
      
      updateQuantity: (productId, quantity) => set((state) => ({
        cart: state.cart.map(item =>
          item.id === productId
            ? { ...item, quantity }
            : item
        )
      })),
      
      clearCart: () => set({ cart: [] }),
      
      toggleFavorite: (productId) => set((state) => ({
        favorites: state.favorites.includes(productId)
          ? state.favorites.filter(id => id !== productId)
          : [...state.favorites, productId]
      }))
    }),
    {
      name: 'boutique-storage',
    }
  )
)