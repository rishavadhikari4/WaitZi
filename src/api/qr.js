import api from './axios';

export const getOrderingPageData = (tableId) => api.get(`/qr/order/table/${tableId}`);

export const getOrderingPageByNumber = (tableNumber) => api.get(`/qr/order/table-number/${tableNumber}`);

export const generateQR = (tableId) => api.get(`/qr/generate/${tableId}`);

export const downloadQR = (tableId) =>
  api.get(`/qr/download/${tableId}`, { responseType: 'blob' });

export const generateAllQRs = () => api.get('/qr/generate-all');

export const generateBrandedQR = (tableId, data) => api.post(`/qr/branded/${tableId}`, data);

export const getQRAnalytics = (tableId) => api.get(`/qr/analytics/${tableId}`);
