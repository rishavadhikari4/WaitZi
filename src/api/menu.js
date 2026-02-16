import api from './axios';

export const getPublicMenu = (params) => api.get('/menu/public', { params });

export const getMenuByCategory = (categoryId) => api.get(`/menu/public/category/${categoryId}`);

export const getMenuItem = (id) => api.get(`/menu/public/${id}`);

export const createMenuItem = (formData) =>
  api.post('/menu', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const updateMenuItem = (id, formData) =>
  api.put(`/menu/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const updateMenuAvailability = (id, availabilityStatus) =>
  api.patch(`/menu/${id}/availability`, { availabilityStatus });

export const deleteMenuItem = (id) => api.delete(`/menu/${id}`);
