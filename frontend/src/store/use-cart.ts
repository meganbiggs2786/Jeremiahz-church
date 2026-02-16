import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  size?: string
  image: string
}

interface CartStore {
  items: CartItem[]
  addItem: (product: CartItem) => void
  removeItem: (id: number, size?: string) => void
  updateQuantity: (id: number, quantity: number, size?: string) => void
  clearCart: () => void
  total: () => number
  itemCount: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const items = get().items
        const existingItem = items.find(
          (item) => item.id === product.id && item.size === product.size
        )

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === product.id && item.size === product.size
                ? { ...item, quantity: item.quantity + product.quantity }
                : item
            ),
          })
        } else {
          set({ items: [...items, product] })
        }
      },
      removeItem: (id, size) => {
        set({
          items: get().items.filter(
            (item) => !(item.id === id && item.size === size)
          ),
        })
      },
      updateQuantity: (id, quantity, size) => {
        set({
          items: get().items.map((item) =>
            item.id === id && item.size === size
              ? { ...item, quantity: Math.max(1, quantity) }
              : item
          ),
        })
      },
      clearCart: () => set({ items: [] }),
      total: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        )
      },
      itemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'tuath-coir-cart',
    }
  )
)
