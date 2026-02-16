import api from './axios';

export const login = (credentials) => api.post('/auth/login', credentials);

export const register = (userData) => api.post('/auth/register', userData);

export const refreshToken = () => api.post('/auth/refresh-token');

export const verifyToken = () => api.get('/auth/verify');

export const logout = () => api.post('/auth/logout');
