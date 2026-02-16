import api from './axios';

export const getProfile = () => api.get('/users/profile');

export const updateProfile = (formData) =>
  api.put('/users/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const updatePassword = (id, data) => api.patch(`/users/${id}/password`, data);

export const getAllUsers = (params) => api.get('/users', { params });

export const getUsersByRole = (roleId) => api.get(`/users/role/${roleId}`);

export const getUser = (id) => api.get(`/users/${id}`);

export const updateUser = (id, formData) =>
  api.put(`/users/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const updateUserStatus = (id, data) => api.patch(`/users/${id}/status`, data);

export const deleteUser = (id) => api.delete(`/users/${id}`);
