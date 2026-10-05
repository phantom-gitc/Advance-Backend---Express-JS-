import { create } from 'zustand';

export const useWishlistStore = create((set, get) => ({
  items: JSON.parse(localStorage.getItem('atelier_wishlist') || '[]'),

  toggleWishlist: (product) => {
    const items = get().items;
    const exists = items.some((item) => (item._id || item.id) === (product._id || product.id));

    let updated;
    if (exists) {
      updated = items.filter((item) => (item._id || item.id) !== (product._id || product.id));
    } else {
      updated = [...items, product];
    }

    localStorage.setItem('atelier_wishlist', JSON.stringify(updated));
    set({ items: updated });
    return !exists;
  },

  isInWishlist: (productId) => {
    const items = get().items;
    return items.some((item) => (item._id || item.id) === productId);
  },

  removeItem: (productId) => {
    const updated = get().items.filter((item) => (item._id || item.id) !== productId);
    localStorage.setItem('atelier_wishlist', JSON.stringify(updated));
    set({ items: updated });
  },
}));
