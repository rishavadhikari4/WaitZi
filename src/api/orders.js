import api from './axios';

export const createPublicOrder = (orderData) => api.post('/orders/public', orderData);

export const getOrdersByTable = (tableId) => api.get(`/orders/public/table/${tableId}`);

export const getAllOrders = (params) => api.get('/orders', { params });

export const getOrder = (id) => api.get(`/orders/${id}`);

export const getKitchenQueue = (params) => api.get('/orders/kitchen/queue', { params });

export const updateOrderStatus = (id, data) => api.patch(`/orders/${id}/status`, data);

export const updateOrderItemStatus = (orderId, itemId, data) =>
  api.patch(`/orders/${orderId}/items/${itemId}/status`, data);

export const addItemsToOrder = (id, data) => api.post(`/orders/${id}/items`, data);

export const cancelOrder = (id, data) => api.patch(`/orders/${id}/cancel`, data);
