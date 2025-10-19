import { create } from "zustand";

export type CartItem = { id: string; title: string; price: number; cover?: string; qty: number };
type PlayerState = { track?: { id: string; title: string; artist?: string; src: string; price?: number; artwork?: string } };

type State = {
  cartOpen: boolean;
  items: CartItem[];
  player: PlayerState;
  toggleCart: () => void;
  addToCart: (item: Omit<CartItem, "qty">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  setTrack: (t: PlayerState["track"]) => void;
};

export const useStore = create<State>((set) => ({
  cartOpen: false,
  items: [],
  player: {},
  toggleCart: () => set((s) => ({ cartOpen: !s.cartOpen })),
  addToCart: (item) =>
    set((s) => {
      const found = s.items.find((i) => i.id === item.id);
      if (found) {
        return { items: s.items.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i)) };
      }
      return { items: [...s.items, { ...item, qty: 1 }] };
    }),
  removeFromCart: (id) => set((s) => ({ items: s.items.filter((i) => i.id != id) })),
  updateQuantity: (id, qty) =>
    set((s) => {
      if (qty <= 0) {
        return { items: s.items.filter((i) => i.id !== id) };
      }
      return {
        items: s.items.map((i) => (i.id === id ? { ...i, qty } : i)),
      };
    }),
  setTrack: (t) => set(() => ({ player: { track: t } })),
}));
