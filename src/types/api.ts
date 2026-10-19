// src/types/api.ts
// Shapes returned by the WaitZi API (see WaitZi_Backend/src/services/**/*.mapper.ts).
// Every object has `id`; the API also sends an `_id` alias for older code.

export type ID = string;

export interface Entity {
  id: ID;
  _id: ID;
}

/** Every response is wrapped in this envelope (axios returns it directly). */
export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
  stats?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

/** Rejected promise from the axios interceptor. */
export interface ApiError {
  message: string;
  status?: number;
  data?: { code?: string; errors?: Record<string, string[]> | string[]; [key: string]: unknown };
}

// ── People ──────────────────────────────────────────────────────────────────

export interface Role extends Entity {
  name: string;
  description: string;
  permissions: string[];
  isSystem?: boolean;
  orgId?: ID;
}

export interface Organization extends Entity {
  name: string;
  slug: string;
}

export type ActiveStatus = 'Active' | 'Inactive';

export interface User extends Entity {
  firstName: string;
  lastName: string;
  email: string;
  number: string;
  address: string;
  image: string | null;
  imageId: string | null;
  status: ActiveStatus;
  role: Role;
  mustChangePassword: boolean;
  passwordChangedAt?: string;
  branchIds?: ID[];
  organization?: Organization;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResult {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  mustChangePassword: boolean;
  scope: 'tenant' | 'platform';
}

export interface ChooseOrganization {
  requiresOrganization: true;
  organizations: { id: ID; name: string; slug: string; role: string }[];
}

// ── Menu ────────────────────────────────────────────────────────────────────

export interface Category extends Entity {
  name: string;
  description: string | null;
  image: string | null;
  imageId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Availability = 'Available' | 'Out of Stock';

export interface MenuItem extends Entity {
  name: string;
  price: number;
  description: string | null;
  image: string | null;
  imageId: string | null;
  availabilityStatus: Availability;
  category: Pick<Category, 'id' | '_id' | 'name' | 'description' | 'image'> | ID;
  createdAt: string;
  updatedAt: string;
}

// ── Floor ───────────────────────────────────────────────────────────────────

export type TableStatus = 'Available' | 'Occupied' | 'Reserved';

export interface PersonRef extends Partial<Entity> {
  firstName: string;
  lastName: string;
  email?: string;
}

export interface TableOrderSummary extends Entity {
  customerName: string;
  totalAmount: number;
  finalAmount: number;
  status: OrderStatus;
  createdAt: string;
  items: { id: ID; _id: ID; name: string; quantity: number; price: number; status: OrderItemStatus }[];
}

export interface DiningTable extends Entity {
  tableNumber: number;
  capacity: number;
  status: TableStatus;
  qrToken: string;
  branchId: ID;
  assignedWaiter: PersonRef | null;
  assignedWaiterId?: ID | null;
  currentOrder: TableOrderSummary | null;
  currentOrderId?: ID | null;
  isAvailableForOrder?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Orders ──────────────────────────────────────────────────────────────────

export type OrderStatus = 'Pending' | 'InKitchen' | 'Served' | 'Cancelled' | 'Paid' | 'Completed';
export type OrderItemStatus = 'Pending' | 'Cooking' | 'Ready' | 'Served';

export interface OrderItem extends Entity {
  menuItem: { id: ID; _id: ID; name: string; category: ID; image: string | null; description: string | null } | null;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  status: OrderItemStatus;
  notes: string | null;
}

export interface OrderStats {
  totalItems: number;
  totalQuantity: number;
  pendingItems: number;
  cookingItems: number;
  readyItems: number;
  servedItems: number;
}

export interface Order extends Entity {
  table: { id: ID; _id: ID; tableNumber: number; capacity: number; status: TableStatus };
  branchId: ID;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  status: OrderStatus;
  assignedWaiter: PersonRef | null;
  cookedBy?: PersonRef | null;
  servedBy?: PersonRef | null;
  orderTimeout: string;
  isTimedOut: boolean;
  isPrepaid: boolean;
  note: string | null;
  orderStats: OrderStats;
  createdAt: string;
  updatedAt: string;
}

export interface KitchenOrder extends Order {
  itemsByStatus: { pending: OrderItem[]; cooking: OrderItem[]; ready: OrderItem[] };
}

// ── Payments ────────────────────────────────────────────────────────────────

export type PaymentMethod = 'Cash' | 'Card' | 'Fonepay' | 'NepalPay' | 'Khalti';
export type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded';

export interface Payment extends Entity {
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId: string | null;
  khaltiPidx: string | null;
  paymentTime: string;
  order: {
    id: ID;
    _id: ID;
    customerName: string;
    status: OrderStatus;
    totalAmount: number;
    finalAmount: number;
    items: { id: ID; _id: ID; name: string; quantity: number; price: number; subtotal: number }[];
  } | null;
  table: { id: ID; _id: ID; tableNumber: number; capacity: number } | null;
  handledBy: PersonRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface RefundResult {
  refund: Payment;
  originalPayment: Payment;
  refundAmount: number;
  remainingRefundable: number;
  reason: string;
}

export interface DailySalesReport {
  date: string;
  timeZone: string;
  summary: { totalSales: number; grossSales: number; refunds: number; totalTransactions: number; averageTransaction: number };
  paymentMethods: { _id: string; method: string; total: number; count: number }[];
  hourlyBreakdown: { _id: number; hour: number; total: number; count: number }[];
  transactions: (Omit<Payment, 'order' | 'table' | 'handledBy'> & {
    order: { id: ID; customerName: string } | null;
    table: { id: ID; tableNumber: number } | null;
  })[];
}

// ── Guest ordering ──────────────────────────────────────────────────────────

export interface OrderingPage {
  table: Omit<DiningTable, 'assignedWaiter'> & { assignedWaiter: { firstName: string; lastName: string } | null; isAvailableForOrder: boolean };
  menu: (Category & { items: MenuItem[] })[];
  restaurant: { name: string; slug: string; branding: Record<string, unknown>; welcomeMessage: string };
}

export interface KhaltiStart {
  paymentId: ID;
  pidx: string;
  payment_url: string;
  expires_at: string;
}

// ── QR codes ────────────────────────────────────────────────────────────────

export interface TableSummary {
  id: ID;
  _id: ID;
  tableNumber: number;
  capacity: number;
  status?: TableStatus;
}

export interface QrCodeResult {
  qrCode?: string;
  qrData: string;
  table: TableSummary;
}

export interface QrAnalytics {
  table: TableSummary;
  qrData: string;
  analytics: {
    totalScans: number | null;
    uniqueScans: number | null;
    ordersFromScans: number;
    conversionRate: string | null;
    lastOrderAt: string | null;
  };
  note: string;
}

// ── Dashboard ───────────────────────────────────────────────────────────────

export type Period = 'today' | 'yesterday' | 'week' | 'month' | 'year';

export interface TrendPoint {
  _id: { year: number; month: number; day?: number; hour?: number };
  totalSales: number;
  orderCount: number;
}

export interface ItemPerformance {
  _id: ID;
  name: string;
  category?: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface TableStats {
  total: number;
  byStatus: { available: number; occupied: number; reserved: number };
}

export interface DashboardOverview {
  period: Period;
  overview: {
    orders: { totalOrders: number; completedOrders: number; cancelledOrders: number; totalRevenue: number; averageOrderValue: number };
    payments: { totalPayments: number; totalAmount: number };
    totalTables: number;
    availableMenuItems: number;
  };
  recentActivity: { orders: Order[]; pendingOrders: Order[] };
  analytics: { salesTrends: TrendPoint[]; popularItems: ItemPerformance[] };
  operations: { tableStatus: TableStats; staffStats: { total: number; active: number } };
}

export interface SalesAnalytics {
  summary: { totalSales: number; grossSales: number; refunds: number; totalTransactions: number; averageTransaction: number };
  trends: TrendPoint[];
  breakdowns: {
    paymentMethods: { _id: string; total: number; count: number }[];
    hourlyDistribution: { _id: number; total: number; count: number }[];
    categoryPerformance: ItemPerformance[];
  };
  customers: { _id: string; orderCount: number; totalSpent: number }[];
}

export interface OperationalInsights {
  kitchen: { activeOrders: number; pendingOrders: number; inKitchen: number };
  service: { totalOrders: number; cancelledOrders: number; cancellationRate: string };
  tables: TableStats & { utilization: { totalCapacity: number; occupiedCapacity: number } };
  staff: { total: number; active: number };
  orders: { statusDistribution: { _id: OrderStatus; count: number }[]; averageValue: number };
}

export interface MenuAnalytics {
  summary: { totalItemsSold: number; totalMenuItems: number; availableItems: number; outOfStockItems: number };
  performance: { topSelling: ItemPerformance[]; underPerforming: ItemPerformance[] };
  analytics: { categoryBreakdown: ItemPerformance[]; profitability: unknown[] };
  alerts: { _id: ID; name: string }[];
}

export interface RealTimeStatus {
  activeOrders: number;
  pendingOrders: number;
  kitchenQueue: number;
  availableTables: number;
  occupiedTables: number;
  staffOnDuty: number;
  totalRevenue: number;
  lastUpdated: string;
}

// ── Real-time ───────────────────────────────────────────────────────────────

/** Payload of order:* socket events. */
export interface OrderEventPayload {
  orderId?: ID;
  tableId?: ID | null;
  order?: Order;
}
