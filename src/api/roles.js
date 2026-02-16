import api from './axios';

export const getAllRoles = () => api.get('/roles');

export const getRole = (id) => api.get(`/roles/${id}`);

export const createRole = (data) => api.post('/roles', data);

export const updateRole = (id, data) => api.patch(`/roles/${id}`, data);

export const deleteRole = (id) => api.delete(`/roles/${id}`);
