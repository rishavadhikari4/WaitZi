import api from './axios';

export const getRealTimeStatus = () => api.get('/dashboard/real-time');

export const getDashboardOverview = (params) => api.get('/dashboard/overview', { params });

export const getSalesAnalytics = (params) => api.get('/dashboard/sales', { params });

export const getOperationalInsights = (params) => api.get('/dashboard/operations', { params });

export const getMenuAnalytics = (params) => api.get('/dashboard/menu', { params });
