'use client';

import { useState, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Zustand's `persist` middleware reads localStorage, which doesn't exist
 * during server rendering — so the very first render (server, and the
 * client's first pass before rehydration) always sees the *default* store
 * values, then may "jump" to the real persisted values a moment later.
 * If a component renders different output for those two cases, React
 * throws a hydration mismatch error. Any component that shows different
 * UI based on persisted state (cart count, logged-in state, etc.) should
 * use this hook and only trust that state once `hasHydrated` is true —
 * before that, render the same thing the server rendered.
 */
export function useHasHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

// --- Cart -------------------------------------------------------------
// Persisted to localStorage so a cart survives a refresh or a closed tab.
// This is a real deployed app (not a sandboxed artifact), so localStorage
// via Zustand's persist middleware is the right tool here.
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // { productId, slug, name, image, price, size, color, qty }
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (item) => {
        const items = [...get().items];
        const key = (i) => `${i.productId}__${i.size || ''}__${i.color || ''}`;
        const idx = items.findIndex((i) => key(i) === key(item));
        if (idx > -1) {
          items[idx] = { ...items[idx], qty: items[idx].qty + item.qty };
        } else {
          items.push(item);
        }
        set({ items });
      },

      removeItem: (productId, size, color) => {
        set({
          items: get().items.filter(
            (i) => !(i.productId === productId && i.size === size && i.color === color)
          ),
        });
      },

      updateQty: (productId, size, color, qty) => {
        if (qty < 1) return;
        set({
          items: get().items.map((i) =>
            i.productId === productId && i.size === size && i.color === color
              ? { ...i, qty }
              : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    {
      name: 'kal-cart',
      // Only persist the actual cart contents — NOT isOpen, so the drawer
      // never "remembers" being open from a previous visit and pops open
      // unexpectedly on a later page load.
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// --- Quick-view / UI state --------------------------------------------
export const useUIStore = create((set) => ({
  quickViewSlug: null,
  openQuickView: (slug) => set({ quickViewSlug: slug }),
  closeQuickView: () => set({ quickViewSlug: null }),

  mobileMenuOpen: false,
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
}));

// --- Auth ---------------------------------------------------------------
export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      updateUser: (user) => set({ user }),
    }),
    { name: 'kal-auth' }
  )
);

// --- Recently viewed ------------------------------------------------------
export const useRecentlyViewedStore = create(
  persist(
    (set, get) => ({
      items: [], // { id, slug, name, image, price }
      addRecentlyViewed: (product) => {
        const items = get().items.filter((p) => p.slug !== product.slug);
        items.unshift(product);
        set({ items: items.slice(0, 8) });
      },
    }),
    { name: 'kal-recently-viewed' }
  )
);

// --- Toasts -------------------------------------------------------------
let toastId = 0;
export const useToastStore = create((set, get) => ({
  toasts: [], // { id, message, type }
  showToast: (message, type = 'success') => {
    const id = ++toastId;
    set({ toasts: [...get().toasts, { id, message, type }] });
    setTimeout(() => {
      set({ toasts: get().toasts.filter((t) => t.id !== id) });
    }, 3500);
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));