import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { getOrdersByTable } from '../../api/orders';
import { initiateKhaltiPayment } from '../../api/payments';
import { getOrderingPageByToken } from '../../api/qr';
import usePolling from '../../hooks/usePolling';
import useSocket from '../../hooks/useSocket';
import useCart from '../../hooks/useCart';
import Spinner from '../../components/ui/Spinner';
import { Skeleton } from '../../components/ui/Skeleton';
import type { ApiError, Order } from '../../types/api';
import { formatCurrency, formatTime } from '../../utils/formatters';

const statusSteps = [
  { key: 'Pending', label: 'Received', icon: 'mdi:clock-outline' },
  { key: 'InKitchen', label: 'Preparing', icon: 'mdi:chef-hat' },
  { key: 'Served', label: 'Served', icon: 'mdi:silverware-fork-knife' },
];

const statusIndex: Record<string, number> = { Pending: 0, InKitchen: 1, Cooking: 1, Ready: 1, Served: 2, Completed: 2, Paid: 2 };

const statusLabels: Record<string, { text: string; bg: string; fg: string }> = {
  Pending: { text: 'Order Received', bg: 'bg-blue-100', fg: 'text-blue-700' },
  InKitchen: { text: 'Being Prepared', bg: 'bg-amber-100', fg: 'text-amber-700' },
  Cooking: { text: 'Cooking', bg: 'bg-orange-100', fg: 'text-orange-700' },
  Ready: { text: 'Ready', bg: 'bg-emerald-100', fg: 'text-emerald-700' },
  Served: { text: 'Served', bg: 'bg-emerald-100', fg: 'text-emerald-700' },
  Completed: { text: 'Completed', bg: 'bg-gray-100', fg: 'text-gray-700' },
  Paid: { text: 'Paid', bg: 'bg-blue-100', fg: 'text-blue-700' },
  Cancelled: { text: 'Cancelled', bg: 'bg-red-100', fg: 'text-red-700' },
};

function PaymentSection({ order, qrToken }: { order: Order; qrToken: string }) {
  const [showCashMsg, setShowCashMsg] = useState(false);
  const [isKhaltiLoading, setIsKhaltiLoading] = useState(false);
  const [khaltiError, setKhaltiError] = useState('');

  const handleKhaltiPay = async () => {
    setIsKhaltiLoading(true);
    setKhaltiError('');
    try {
      const res = await initiateKhaltiPayment(qrToken, order.id);
      const paymentUrl = res.data?.payment_url;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        setKhaltiError('Could not get payment URL. Please try again.');
      }
    } catch (err) {
      setKhaltiError((err as ApiError).message || 'Failed to initiate Khalti payment');
    } finally {
      setIsKhaltiLoading(false);
    }
  };

  return (
    <div className="px-4 pb-4 pt-1">
      <div className="border-t border-dashed border-gray-200 pt-3">
        <p className="text-xs text-gray-500 font-medium mb-2.5 text-center">How would you like to pay?</p>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCashMsg(!showCashMsg)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-colors"
          >
            <Icon icon="mdi:cash" className="w-4 h-4 text-blue-700" /> Cash
          </button>
          <button
            onClick={handleKhaltiPay}
            disabled={isKhaltiLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-60"
          >
            {isKhaltiLoading ? (
              <Spinner size="sm" className="text-white" />
            ) : (
              <Icon icon="mdi:wallet-outline" className="w-4 h-4" />
            )}
            Khalti
          </button>
        </div>
        {showCashMsg && (
          <p className="text-xs text-center text-amber-600 bg-amber-50 rounded-lg py-2 mt-2">
            Please ask your waiter to process the cash payment.
          </p>
        )}
        {khaltiError && (
          <p className="text-xs text-center text-red-600 bg-red-50 rounded-lg py-2 mt-2">
            {khaltiError}
          </p>
        )}
      </div>
    </div>
  );
}

export default function OrderTracking() {
  const { qrToken = '' } = useParams();
  const cart = useCart();
  // The cart knows the table when the guest came from the menu; a fresh visit looks it up.
  const known = cart.table?.qrToken === qrToken ? cart.table : null;
  const [table, setTable] = useState(known);

  useEffect(() => {
    if (table) return;
    getOrderingPageByToken(qrToken)
      .then((res) => setTable({ id: res.data.table.id, number: res.data.table.tableNumber, qrToken }))
      .catch(() => {});
  }, [qrToken, table]);

  const tableNumber = table?.number;

  const { data, isLoading, refresh } = usePolling(
    () => getOrdersByTable(qrToken),
    30000, // slow fallback; the socket delivers updates instantly
    !!qrToken,
  );

  // Socket.IO for instant updates
  const socketRooms = useMemo(() => (table ? [`table:${table.id}`] : []), [table]);
  const socketEvents = useMemo(() => ({
    'order:new': () => refresh(),
    'order:status-updated': () => refresh(),
    'order:item-updated': () => refresh(),
    'order:paid': () => refresh(),
    'order:cancelled': () => refresh(),
    'order:items-added': () => refresh(),
  }), [refresh]);
  useSocket(socketRooms, socketEvents);

  if (isLoading) {
    return (
      <div className="space-y-5 pb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <div className="flex items-center justify-between px-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="w-8 h-8 rounded-full" />
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  const orders: Order[] = data?.data ?? [];

  if (!orders.length) {
    return (
      <div className="text-center py-14">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon icon="mdi:silverware-fork-knife" className="w-7 h-7 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">No active orders</p>
        <p className="text-sm text-gray-400 mt-1 font-mono">TABLE {tableNumber}</p>
        <Link
          to={`/t/${qrToken}`}
          className="inline-flex items-center gap-1.5 mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Icon icon="mdi:plus" className="w-4 h-4" /> Place an order
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
          <div className="inline-flex items-center gap-1 text-xs text-gray-500 font-mono font-medium mt-1">
            <Icon icon="mdi:map-marker-outline" className="w-3 h-3 text-blue-600" /> TABLE {tableNumber}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Live updates
        </div>
      </div>

      {/* Order cards */}
      {orders.map((order) => {
        const step = statusIndex[order.status] ?? 0;
        const label = statusLabels[order.status] || statusLabels.Pending;
        const showPayment = order.status === 'Served' && !order.isPrepaid;

        return (
          <div key={order.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Order header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-dashed border-gray-200">
              <p className="text-xs text-gray-400 font-mono font-medium">{formatTime(order.createdAt)}</p>
              <div className="flex items-center gap-1.5">
                {order.isPrepaid && order.status !== 'Paid' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    <Icon icon="mdi:check-circle" className="w-3 h-3" /> Prepaid
                  </span>
                )}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${label.bg} ${label.fg}`}>
                  {label.text}
                </span>
              </div>
            </div>

            {/* Progress stepper */}
            <div className="px-4 py-4">
              <div className="flex items-center justify-between relative">
                {/* Progress line background */}
                <div className="absolute top-4 left-6 right-6 h-0.5 bg-gray-100" />
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
                          : 'bg-white border-2 border-gray-200 text-gray-300'
                      }`}
                    >
                      <Icon icon={s.icon} className="w-4 h-4" />
                    </div>
                    <p className={`text-xs mt-1.5 font-medium ${
                      i <= step ? 'text-blue-700' : 'text-gray-300'
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
                    <div key={i} className="flex items-center text-sm py-1 gap-2">
                      <span className="text-gray-700 shrink-0">
                        <span className="font-mono font-medium text-blue-700">{item.quantity}×</span> {item.menuItem?.name || 'Item'}
                      </span>
                      {item.status && item.status !== order.status && itemLabel && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${itemLabel.bg} ${itemLabel.fg}`}>
                          {itemLabel.text}
                        </span>
                      )}
                      <span className="leader" />
                      <span className="text-gray-500 text-xs font-mono shrink-0">{formatCurrency(item.subtotal || item.price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center mt-3 pt-3 border-t border-dashed border-gray-200">
                <span className="text-sm text-gray-500 font-medium">Total</span>
                <span className="font-mono font-bold text-gray-900">{formatCurrency(order.finalAmount || order.totalAmount)}</span>
              </div>
            </div>

            {/* Payment section - only shown when order is Served */}
            {showPayment && <PaymentSection order={order} qrToken={qrToken} />}
          </div>
        );
      })}

      {/* Order More button */}
      <Link to={`/t/${qrToken}`}>
        <button className="w-full bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 py-3 rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2">
          <Icon icon="mdi:plus" className="w-4 h-4" /> Order More
        </button>
      </Link>
    </div>
  );
}
