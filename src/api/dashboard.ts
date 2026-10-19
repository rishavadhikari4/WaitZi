import type { DashboardOverview, MenuAnalytics, OperationalInsights, Period, RealTimeStatus, SalesAnalytics } from '../types/api';

import { http } from './axios';

type PeriodParams = { period?: Period; categoryId?: string };

export const getRealTimeStatus = () => http.get<RealTimeStatus>('/client/dashboard/real-time');

export const getDashboardOverview = (params?: PeriodParams) => http.get<DashboardOverview>('/client/dashboard/overview', { params });

export const getSalesAnalytics = (params?: PeriodParams) => http.get<SalesAnalytics>('/client/dashboard/sales', { params });

export const getOperationalInsights = (params?: PeriodParams) => http.get<OperationalInsights>('/client/dashboard/operations', { params });

export const getMenuAnalytics = (params?: PeriodParams) => http.get<MenuAnalytics>('/client/dashboard/menu', { params });
