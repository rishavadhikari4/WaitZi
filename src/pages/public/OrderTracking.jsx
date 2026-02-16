import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Clock, ChefHat, UtensilsCrossed, MapPin, Plus } from 'lucide-react';
import { getOrdersByTable } from '../../api/orders';
import { getOrderingPageByNumber } from '../../api/qr';
import usePolling from '../../hooks/usePolling';
import useCart from '../../hooks/useCart';
import Spinner from '../../components/ui/Spinner';
import { formatCurrency, formatTime } from '../../utils/formatters';

const statusSteps = [
  { key: 'Pending', label: 'Received', icon: Clock, color: 'blue' },
  { key: 'InKitchen', label: 'Preparing', icon: ChefHat, color: 'blue' },
  { key: 'Served', label: 'Served', icon: UtensilsCrossed, color: 'blue' },
];

const statusIndex = { Pending: 0, InKitchen: 1, Cooking: 1, Ready: 1, Served: 2, Completed: 2, Paid: 2 };

const statusLabels = {
  Pending: { text: 'Order Received', bg: 'bg-blue-100', fg: 'text-blue-700' },
  InKitchen: { text: 'Being Prepared', bg: 'bg-amber-100', fg: 'text-amber-700' },
  Cooking: { text: 'Cooking', bg: 'bg-orange-100', fg: 'text-orange-700' },
  Ready: { text: 'Ready', bg: 'bg-green-100', fg: 'text-green-700' },
  Served: { text: 'Served', bg: 'bg-green-100', fg: 'text-green-700' },
  Completed: { text: 'Completed', bg: 'bg-gray-100', fg: 'text-gray-700' },
  Paid: { text: 'Paid', bg: 'bg-blue-100', fg: 'text-blue-700' },
  Cancelled: { text: 'Cancelled', bg: 'bg-red-100', fg: 'text-red-700' },
};

export default function OrderTracking() {
  const { tableNumber } = useParams();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('tableId');
  const cart = useCart();
  const [resolvedTableId, setResolvedTableId] = useState(tableId || cart.tableId);

  useEffect(() => {
    if (resolvedTableId) return;
    getOrderingPageByNumber(tableNumber)
      .then((res) => {
        const id = res.data?.table?._id;
        if (id) setResolvedTableId(id);
      })
      .catch(() => {});
  }, [tableNumber, resolvedTableId]);

  const { data, isLoading } = usePolling(
    () => resolvedTableId ? getOrdersByTable(resolvedTableId) : Promise.resolve(null),
    15000,
    !!resolvedTableId
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Spinner size="lg" className="text-blue-500" />
        <p className="text-sm text-blue-400">Loading orders...</p>
      </div>
    );
  }

  const orders = data?.data || [];

  if (!orders.length) {
    return (
      <div className="text-center py-14">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UtensilsCrossed className="w-7 h-7 text-blue-400" />
        </div>
        <p className="text-gray-500 font-medium">No active orders</p>
        <p className="text-sm text-gray-400 mt-1">for Table {tableNumber}</p>
        <Link
          to={`/order/table/${tableNumber}`}
          className="inline-flex items-center gap-1.5 mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Place an order
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Order Status</h2>
          <div className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium mt-1">
            <MapPin className="w-3 h-3" /> Table {tableNumber}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-blue-400">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          Live updates
        </div>
      </div>

      {/* Order cards */}
      {orders.map((order) => {
        const step = statusIndex[order.status] ?? 0;
        const label = statusLabels[order.status] || statusLabels.Pending;

        return (
          <div key={order._id} className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm">
            {/* Order header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
              <p className="text-xs text-gray-400 font-medium">{formatTime(order.createdAt)}</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${label.bg} ${label.fg}`}>
                {label.text}
              </span>
            </div>

            {/* Progress stepper */}
            <div className="px-4 py-4">
              <div className="flex items-center justify-between relative">
                {/* Progress line background */}
                <div className="absolute top-4 left-6 right-6 h-0.5 bg-blue-100" />
                {/* Active progress line */}
                <div
                  className="absolute top-4 left-6 h-0.5 bg-blue-500 transition-all duration-700"
                  style={{ width: `calc(${(step / (statusSteps.length - 1)) * 100}% - 48px)` }}
                />

                {statusSteps.map((s, i) => (
                  <div key={s.key} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                        i <= step
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                          : 'bg-white border-2 border-blue-200 text-blue-300'
                      }`}
                    >
                      <s.icon className="w-4 h-4" />
                    </div>
                    <p className={`text-xs mt-1.5 font-medium ${
                      i <= step ? 'text-blue-600' : 'text-gray-300'
                    }`}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Items */}
            <div className="px-4 pb-3">
              <div className="space-y-1.5">
                {order.items?.map((item, i) => {
                  const itemLabel = statusLabels[item.status];
                  return (
                    <div key={i} className="flex justify-between items-center text-sm py-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700">
                          <span className="font-medium text-blue-600">{item.quantity}x</span> {item.menuItem?.name || 'Item'}
                        </span>
                        {item.status && item.status !== order.status && itemLabel && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${itemLabel.bg} ${itemLabel.fg}`}>
                            {itemLabel.text}
                          </span>
                        )}
                      </div>
                      <span className="text-gray-400 text-xs">{formatCurrency(item.subtotal || item.menuItem?.price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center mt-3 pt-3 border-t border-blue-100">
                <span className="text-sm text-gray-500 font-medium">Total</span>
                <span className="font-bold text-blue-600">{formatCurrency(order.finalAmount || order.totalAmount)}</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Order More button */}
      <Link to={`/order/table/${tableNumber}`}>
        <button className="w-full bg-white text-blue-600 border-2 border-blue-200 hover:bg-blue-50 py-3 rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Order More
        </button>
      </Link>
    </div>
  );
}
