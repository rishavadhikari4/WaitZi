import api from './axios';

export const getPublicTable = (id) => api.get(`/tables/public/${id}`);

export const getPublicTableByNumber = (tableNumber) => api.get(`/tables/public/number/${tableNumber}`);

export const getAllTables = (params) => api.get('/tables', { params });

export const createTable = (data) => api.post('/tables', data);

export const updateTableStatus = (id, data) => api.patch(`/tables/${id}/status`, data);

export const assignOrderToTable = (data) => api.post('/tables/assign-order', data);

export const clearTable = (id) => api.patch(`/tables/${id}/clear`);

export const getTable = (id) => api.get(`/tables/${id}`);

export const updateTable = (id, data) => api.put(`/tables/${id}`, data);

export const deleteTable = (id) => api.delete(`/tables/${id}`);
