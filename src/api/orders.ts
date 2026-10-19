import type { KitchenOrder, Order, OrderItemStatus, OrderStatus } from '../types/api';

import { http } from './axios';

export interface OrderLineInput {
  menuItem: string;
  quantity: number;
  notes?: string;
}

// ── Guests (keyed by the table's QR token) ──────────────────────────────────

export const createPublicOrder = (data: { qrToken: string; customerName: string; items: OrderLineInput[]; note?: string }) =>
  http.post<Order>('/public/orders', data);

export const getOrdersByTable = (qrToken: string) => http.get<Order[]>(`/public/qr/${qrToken}/orders`);

// ── Staff ───────────────────────────────────────────────────────────────────

export const createStaffOrder = (data: { tableId: string; customerName: string; items: OrderLineInput[]; note?: string; discount?: number }) =>
  http.post<Order>('/client/orders', data);

export const getAllOrders = (params?: Record<string, unknown>) => http.get<Order[]>('/client/orders', { params });

export const getOrder = (id: string) => http.get<Order>(`/client/orders/${id}`);

export const getKitchenQueue = (params?: Record<string, unknown>) => http.get<KitchenOrder[]>('/client/orders/kitchen/queue', { params });

export const updateOrderStatus = (id: string, data: { status: OrderStatus; cookedBy?: string; servedBy?: string }) =>
  http.patch<Order>(`/client/orders/${id}/status`, data);

export const updateOrderItemStatus = (orderId: string, itemId: string, data: { status: OrderItemStatus; notes?: string }) =>
  http.patch<Order>(`/client/orders/${orderId}/items/${itemId}/status`, data);

export const addItemsToOrder = (id: string, data: { items: OrderLineInput[] }) => http.post<Order>(`/client/orders/${id}/items`, data);

export const cancelOrder = (id: string, data: { reason?: string }) => http.patch<Order>(`/client/orders/${id}/cancel`, data);

export const completeOrder = (id: string) => http.patch<Order>(`/client/orders/${id}/complete`);

export const getStaffOrdersByTable = (tableId: string, status?: OrderStatus) =>
  http.get<Order[]>(`/client/orders/table/${tableId}`, { params: status ? { status } : undefined });
