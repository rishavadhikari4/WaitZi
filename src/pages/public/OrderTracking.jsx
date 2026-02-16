import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Clock, ChefHat, CheckCircle2, UtensilsCrossed } from 'lucide-react';
import { getOrdersByTable } from '../../api/orders';
import { getOrderingPageByNumber } from '../../api/qr';
import usePolling from '../../hooks/usePolling';
import useCart from '../../hooks/useCart';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { formatCurrency, formatTime } from '../../utils/formatters';

const statusSteps = [
  { key: 'Pending', label: 'Order Received', icon: Clock },
  { key: 'InKitchen', label: 'Preparing', icon: ChefHat },
  { key: 'Served', label: 'Served', icon: UtensilsCrossed },
];

const statusIndex = { Pending: 0, InKitchen: 1, Cooking: 1, Ready: 1, Served: 2, Completed: 2, Paid: 2 };

export default function OrderTracking() {
  const { tableNumber } = useParams();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('tableId');
  const cart = useCart();
  const [resolvedTableId, setResolvedTableId] = useState(tableId || cart.tableId);

  // Resolve tableId from tableNumber when not available from query params or cart
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
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const orders = data?.data || [];

  if (!orders.length) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No active orders for this table.</p>
        <Link to={`/order/table/${tableNumber}`} className="text-black hover:underline text-sm mt-2 inline-block">
          Place an order
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <h2 className="text-xl font-bold">Order Status - Table {tableNumber}</h2>

      {orders.map((order) => {
        const step = statusIndex[order.status] ?? 0;
        return (
          <div key={order._id} className="border border-[#E5E5E5] rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{formatTime(order.createdAt)}</p>
              <Badge status={order.status} />
            </div>

            <div className="flex items-center justify-between mb-6">
              {statusSteps.map((s, i) => (
                <div key={s.key} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      i <= step ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <s.icon className="w-4 h-4" />
                  </div>
                  <p className={`text-xs mt-1 ${i <= step ? 'font-medium' : 'text-gray-400'}`}>
                    {s.label}
                  </p>
                  {i < statusSteps.length - 1 && (
                    <div
                      className={`h-0.5 w-full mt-1 ${
                        i < step ? 'bg-black' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.menuItem?.name || 'Item'}
                    {item.status && item.status !== order.status && (
                      <Badge status={item.status} className="ml-2" />
                    )}
                  </span>
                  <span className="text-gray-500">{formatCurrency(item.subtotal || item.menuItem?.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-semibold text-sm mt-3 pt-3 border-t border-[#E5E5E5]">
              <span>Total</span>
              <span>{formatCurrency(order.finalAmount || order.totalAmount)}</span>
            </div>
          </div>
        );
      })}

      <Link to={`/order/table/${tableNumber}`}>
        <button className="w-full btn-secondary">Order More</button>
      </Link>
    </div>
  );
}
