export const ORDER_STATUSES = ['Pending', 'InKitchen', 'Served', 'Cancelled', 'Paid', 'Completed'];
export const ORDER_ITEM_STATUSES = ['Pending', 'Cooking', 'Ready', 'Served'];
export const TABLE_STATUSES = ['Available', 'Occupied', 'Reserved', 'Cleaning'];
export const PAYMENT_METHODS = ['Cash', 'Card', 'Fonepay', 'NepalPay', 'Khalti'];
export const PAYMENT_STATUSES = ['Paid', 'Pending', 'Failed', 'Refunded'];
export const USER_STATUSES = ['Active', 'Inactive'];
export const AVAILABILITY_STATUSES = ['Available', 'Out of Stock'];
export const ROLES = ['admin', 'manager', 'waiter', 'chef', 'kitchen_staff'];
export const DASHBOARD_PERIODS = ['today', 'yesterday', 'week', 'month', 'year'];

export const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-800',
  InKitchen: 'bg-blue-100 text-blue-800',
  Cooking: 'bg-blue-100 text-blue-800',
  Ready: 'bg-indigo-100 text-indigo-800',
  Served: 'bg-indigo-100 text-indigo-800',
  Cancelled: 'bg-red-100 text-red-800',
  Paid: 'bg-green-100 text-green-800',
  Completed: 'bg-green-100 text-green-800',
  Available: 'bg-green-100 text-green-800',
  Occupied: 'bg-yellow-100 text-yellow-800',
  Reserved: 'bg-blue-100 text-blue-800',
  Cleaning: 'bg-gray-100 text-gray-800',
  Active: 'bg-green-100 text-green-800',
  Inactive: 'bg-red-100 text-red-800',
  'Out of Stock': 'bg-red-100 text-red-800',
  Failed: 'bg-red-100 text-red-800',
  Refunded: 'bg-purple-100 text-purple-800',
};
