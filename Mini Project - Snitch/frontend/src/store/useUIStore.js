import { create } from 'zustand';

export const useUIStore = create((set) => ({
  toasts: [],
  searchQuery: '',
  selectedCategory: 'All',
  quickAddProduct: null,

  addToast: ({ message, type = 'info', duration = 3000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setQuickAddProduct: (product) => set({ quickAddProduct: product }),
}));
