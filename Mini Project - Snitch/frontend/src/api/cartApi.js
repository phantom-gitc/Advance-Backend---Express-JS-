import api from './axios';

export const cartApi = {
  getCart: async () => {
    const res = await api.get('/cart');
    return res.data;
  },

  addToCart: async ({ productId, size, quantity = 1, price }) => {
    const res = await api.post('/cart', {
      productId,
      size,
      quantity,
      price,
    });
    return res.data;
  },

  updateItem: async ({ productId, size, quantity }) => {
    const res = await api.patch('/cart/item', {
      productId,
      size,
      quantity,
    });
    return res.data;
  },

  removeItem: async ({ productId, size }) => {
    const res = await api.delete('/cart/item', {
      data: { productId, size },
    });
    return res.data;
  },

  clearCart: async () => {
    const res = await api.delete('/cart');
    return res.data;
  },
};
