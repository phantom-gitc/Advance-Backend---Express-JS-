import { create } from 'zustand';
import { cartApi } from '../api/cartApi';

export const useCartStore = create((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    // Only attempt if user has token
    if (!localStorage.getItem('atelier_access_token')) {
      set({ cart: null });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await cartApi.getCart();
      set({ cart: res.cart || null, isLoading: false });
    } catch (err) {
      if (err?.response?.status === 404) {
        // Cart does not exist yet (normal for new user)
        set({ cart: { products: [], totalPrice: 0 }, isLoading: false });
      } else {
        set({ error: err?.response?.data?.message || err.message, isLoading: false });
      }
    }
  },

  addItem: async ({ productId, size, quantity = 1, price }) => {
    set({ isLoading: true, error: null });
    try {
      await cartApi.addToCart({ productId, size, quantity, price });
      // Refresh cart to get populated product data
      await get().fetchCart();
      return { success: true };
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to add item to bag';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  updateQuantity: async ({ productId, size, quantity }) => {
    if (quantity < 1) return;
    set({ isLoading: true, error: null });
    try {
      await cartApi.updateItem({ productId, size, quantity });
      await get().fetchCart();
      return { success: true };
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to update quantity';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  removeItem: async ({ productId, size }) => {
    set({ isLoading: true, error: null });
    try {
      await cartApi.removeItem({ productId, size });
      await get().fetchCart();
      return { success: true };
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to remove item';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      await cartApi.clearCart();
      set({ cart: { products: [], totalPrice: 0 }, isLoading: false });
      return { success: true };
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to clear cart';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  // Computed helper
  getItemCount: () => {
    const cart = get().cart;
    if (!cart?.products || !Array.isArray(cart.products)) return 0;
    return cart.products.reduce((acc, item) => acc + (item.quantity || 1), 0);
  },
}));
