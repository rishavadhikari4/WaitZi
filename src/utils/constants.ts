import type { OrderItemStatus, OrderStatus, PaymentMethod, PaymentStatus, Period, TableStatus } from '../types/api';

export const ORDER_STATUSES: OrderStatus[] = ['Pending', 'InKitchen', 'Served', 'Cancelled', 'Paid', 'Completed'];
export const ORDER_ITEM_STATUSES: OrderItemStatus[] = ['Pending', 'Cooking', 'Ready', 'Served'];
export const TABLE_STATUSES: TableStatus[] = ['Available', 'Occupied', 'Reserved'];
export const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Card', 'Fonepay', 'NepalPay', 'Khalti'];
export const PAYMENT_STATUSES: PaymentStatus[] = ['Paid', 'Pending', 'Failed', 'Refunded'];
export const USER_STATUSES = ['Active', 'Inactive'];
export const AVAILABILITY_STATUSES = ['Available', 'Out of Stock'];
export const DASHBOARD_PERIODS: Period[] = ['today', 'yesterday', 'week', 'month', 'year'];

export const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-800',
  InKitchen: 'bg-amber-100 text-amber-800',
  Cooking: 'bg-amber-100 text-amber-800',
  Ready: 'bg-blue-100 text-blue-800',
  Served: 'bg-blue-100 text-blue-800',
  Cancelled: 'bg-red-100 text-red-800',
  Paid: 'bg-emerald-100 text-emerald-800',
  Completed: 'bg-emerald-100 text-emerald-800',
  Available: 'bg-emerald-100 text-emerald-800',
  Occupied: 'bg-amber-100 text-amber-800',
  Reserved: 'bg-amber-100 text-amber-800',
  Cleaning: 'bg-gray-100 text-gray-800',
  Active: 'bg-emerald-100 text-emerald-800',
  Inactive: 'bg-red-100 text-red-800',
  'Out of Stock': 'bg-red-100 text-red-800',
  Failed: 'bg-red-100 text-red-800',
  Refunded: 'bg-purple-100 text-purple-800',
};

export const PAYMENT_METHOD_COLORS: Partial<Record<string, { badge: string; hex: string }>> = {
  Cash: { badge: 'bg-emerald-100 text-emerald-800', hex: '#10B981' },
  Khalti: { badge: 'bg-purple-100 text-purple-800', hex: '#7C3AED' },
  Card: { badge: 'bg-blue-100 text-blue-800', hex: '#3B82F6' },
  Fonepay: { badge: 'bg-red-100 text-red-800', hex: '#EF4444' },
  NepalPay: { badge: 'bg-orange-100 text-orange-800', hex: '#F97316' },
};
