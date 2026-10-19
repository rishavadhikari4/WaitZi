import type { DailySalesReport, KhaltiStart, Payment, PaymentMethod, RefundResult } from '../types/api';

import { http } from './axios';

export const processPayment = (data: { orderId: string; paymentMethod: Exclude<PaymentMethod, 'Khalti'>; amount: number; transactionId?: string }) =>
  http.post<Payment>('/client/payments', data);

export const getAllPayments = (params?: Record<string, unknown>) => http.get<Payment[]>('/client/payments', { params });

export const getPayment = (id: string) => http.get<Payment>(`/client/payments/${id}`);

export const getPaymentByOrder = (orderId: string) => http.get<Payment>(`/client/payments/order/${orderId}`);

/** Confirm or fail a pending card/Fonepay/NepalPay payment. */
export const updatePaymentStatus = (id: string, data: { paymentStatus: 'Paid' | 'Failed'; transactionId?: string }) =>
  http.patch<Payment>(`/client/payments/${id}/status`, data);

export const processRefund = (id: string, data: { refundAmount?: number; reason?: string }) => http.post<RefundResult>(`/client/payments/${id}/refund`, data);

export const getDailySales = (params?: { date?: string }) => http.get<DailySalesReport>('/client/payments/reports/daily', { params });

/** Guest Khalti checkout for an order at the table they scanned. */
export const initiateKhaltiPayment = (qrToken: string, orderId: string) => http.post<KhaltiStart>('/public/payments/khalti/initiate', { qrToken, orderId });
