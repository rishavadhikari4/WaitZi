import api from './axios';

export const processPayment = (data) => api.post('/payments', data);

export const getAllPayments = (params) => api.get('/payments', { params });

export const getPayment = (id) => api.get(`/payments/${id}`);

export const getPaymentByOrder = (orderId) => api.get(`/payments/order/${orderId}`);

export const updatePaymentStatus = (id, data) => api.patch(`/payments/${id}/status`, data);

export const processRefund = (id, data) => api.post(`/payments/${id}/refund`, data);

export const getDailySales = (params) => api.get('/payments/reports/daily', { params });

export const initiateKhaltiPayment = (orderId) => api.post('/payments/khalti/initiate', { orderId });
