import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  productName: string;
  farm: string;
  image: string;
  weight: string;
  price: number;
  quantity: number;
  originalPrice: number;
  discount: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string, weight: string) => void;
  updateQuantity: (productId: string, weight: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  setIsOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (item) => set((state) => {
        const existingItemIndex = state.items.findIndex(
          (i) => i.productId === item.productId && i.weight === item.weight
        );
        
        if (existingItemIndex > -1) {
          const newItems = [...state.items];
          newItems[existingItemIndex].quantity += 1;
          return { items: newItems };
        }
        
        return { items: [...state.items, { ...item, quantity: 1 }] };
      }),
      
      removeItem: (productId, weight) => set((state) => ({
        items: state.items.filter(
          (item) => !(item.productId === productId && item.weight === weight)
        )
      })),
      
      updateQuantity: (productId, weight, quantity) => set((state) => {
        if (quantity <= 0) {
          return {
            items: state.items.filter(
              (item) => !(item.productId === productId && item.weight === weight)
            )
          };
        }
        
        const newItems = state.items.map((item) =>
          item.productId === productId && item.weight === weight
            ? { ...item, quantity }
            : item
        );
        
        return { items: newItems };
      }),
      
      clearCart: () => set({ items: [] }),
      
      getTotalPrice: () => {
        const items = get().items;
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      getTotalItems: () => {
        const items = get().items;
        return items.reduce((total, item) => total + item.quantity, 0);
      },
      
      setIsOpen: (isOpen) => set({ isOpen })
    }),
    {
      name: 'cart-storage'
    }
  )
);