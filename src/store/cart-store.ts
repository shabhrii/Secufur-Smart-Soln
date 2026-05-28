import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  id: string // Product ID
  name: string
  price: number
  imageUrl: string
  sellerName: string
  quantity: number
  maxQuantity: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getSubtotal: () => number
  getTotalItems: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem) => set((state) => {
        const existingItem = state.items.find((item) => item.id === newItem.id)
        
        if (existingItem) {
          // Increment quantity, but cap at maxQuantity
          const updatedQuantity = Math.min(
            existingItem.quantity + (newItem.quantity || 1), 
            existingItem.maxQuantity
          )
          
          return {
            items: state.items.map((item) =>
              item.id === newItem.id ? { ...item, quantity: updatedQuantity } : item
            ),
          }
        }
        
        // Add new item
        return {
          items: [...state.items, { ...newItem, quantity: newItem.quantity || 1 }],
        }
      }),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),
      
      updateQuantity: (id, quantity) => set((state) => {
        // Enforce boundaries
        if (quantity < 1) return state
        
        return {
          items: state.items.map((item) => {
            if (item.id === id) {
              return { ...item, quantity: Math.min(quantity, item.maxQuantity) }
            }
            return item
          }),
        }
      }),
      
      clearCart: () => set({ items: [] }),
      
      getSubtotal: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
      
      getTotalItems: () => {
        const { items } = get()
        return items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: "secufur-cart-storage", // unique name in localStorage
    }
  )
)
