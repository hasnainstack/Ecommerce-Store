import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  variant_id: number;
  product_id: number;
  product_name: string;
  product_slug: string;
  product_image_url: string;
  price: number;
  quantity: number;
  stock_qty: number;
  attributes: string;
}

interface CartState {
  sessionId: string | null;
  items: CartItem[];
  _hydrated: boolean;
  setSessionId: (id: string) => void;
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  updateQuantity: (variantId: number, qty: number) => void;
  removeItem: (variantId: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

function generateSessionId() {
  return "sess_" + Math.random().toString(36).substring(2, 15);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      sessionId: typeof window !== "undefined" ? generateSessionId() : null,
      items: [],
      _hydrated: false,
      setSessionId: (id) => set({ sessionId: id }),
      setItems: (items) => set({ items }),
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.variant_id === item.variant_id
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variant_id === item.variant_id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      updateQuantity: (variantId, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.variant_id !== variantId)
              : state.items.map((i) =>
                  i.variant_id === variantId ? { ...i, quantity: qty } : i
                ),
        })),
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variant_id !== variantId),
        })),
      clearCart: () => set({ items: [] }),
      getTotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getItemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        sessionId: state.sessionId,
        items: state.items,
      }),
      onRehydrateStorage: () => () => {
        useCartStore.setState({ _hydrated: true });
      },
    }
  )
);
