import api from './axios';

export const forgotPassword = (email) => api.post('/password/forgot-password', { email });

export const resetPassword = (data) => api.post('/password/reset-password', data);

export const changePassword = (data) => api.post('/password/change-password', data);

export const validateResetToken = (token) => api.get(`/password/validate-token/${token}`);

export const generateTempPassword = (userId) => api.post(`/password/generate-temp-password/${userId}`);
