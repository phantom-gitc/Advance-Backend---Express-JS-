import api from './axios';

export const productApi = {
  getAll: async (params = {}) => {
    const res = await api.get('/products', { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },

  getSellerProducts: async () => {
    const res = await api.get('/products/seller/dashboard');
    return res.data;
  },

  createProduct: async (formData) => {
    // If formData is FormData, let browser/axios set multipart/form-data with boundary
    const isFormData = formData instanceof FormData;
    const res = await api.post('/products', formData, {
      headers: isFormData ? { 'Content-Type': undefined } : undefined,
    });
    return res.data;
  },

  unlistProduct: async (id) => {
    const res = await api.patch(`/products/unlist/${id}`);
    return res.data;
  },

  listProduct: async (id) => {
    const res = await api.patch(`/products/list/${id}`);
    return res.data;
  },
};
