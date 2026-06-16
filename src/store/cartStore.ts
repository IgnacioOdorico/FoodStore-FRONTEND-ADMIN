import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  producto_id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen_url?: string;
  personalizacion?: number[];
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (producto_id: number) => void;
  updateQuantity: (producto_id: number, cantidad: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existing = get().items.find((i) => i.producto_id === item.producto_id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.producto_id === item.producto_id
                ? { ...i, cantidad: i.cantidad + item.cantidad }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
      },

      removeItem: (producto_id) => {
        set({ items: get().items.filter((i) => i.producto_id !== producto_id) });
      },

      updateQuantity: (producto_id, cantidad) => {
        if (cantidad <= 0) {
          get().removeItem(producto_id);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.producto_id === producto_id ? { ...i, cantidad } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.cantidad, 0),

      totalPrice: () => get().items.reduce((sum, i) => sum + i.precio * i.cantidad, 0),
    }),
    { name: 'foodstore-admin-cart' },
  ),
);
