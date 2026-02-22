import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getOrder, updateOrderStatus, updateOrderItemStatus, cancelOrder } from '../../api/orders';
import useSocket from '../../hooks/useSocket';
import PageHeader from '../../components/shared/PageHeader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Spinner from '../../components/ui/Spinner';
import { formatDateTime, formatCurrency } from '../../utils/formatters';
import { ORDER_STATUSES, ORDER_ITEM_STATUSES } from '../../utils/constants';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await getOrder(id);
      setOrder(res.data);
    } catch (err) {
      toast.error(err.message || 'Failed to load order');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  // Socket.IO for instant order updates
  const socketRooms = useMemo(() => id ? [`order:${id}`] : [], [id]);
  const socketEvents = useMemo(() => ({
    'order:status-updated': () => fetchOrder(),
    'order:item-updated': () => fetchOrder(),
    'order:paid': () => fetchOrder(),
    'order:cancelled': () => fetchOrder(),
    'order:items-added': () => fetchOrder(),
  }), [fetchOrder]);
  useSocket(socketRooms, socketEvents);

  const handleStatusChange = async (newStatus) => {
    setIsUpdatingStatus(true);
    try {
      await updateOrderStatus(id, { status: newStatus });
      toast.success('Order status updated');
      fetchOrder();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleItemStatusChange = async (itemId, newStatus) => {
    setUpdatingItemId(itemId);
    try {
      await updateOrderItemStatus(id, itemId, { status: newStatus });
      toast.success('Item status updated');
      fetchOrder();
    } catch (err) {
      toast.error(err.message || 'Failed to update item status');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await cancelOrder(id, { reason: cancelReason });
      toast.success('Order cancelled');
      setShowCancel(false);
      fetchOrder();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!order) return <p className="text-center py-20 text-slate-500">Order not found</p>;

  return (
    <div>
      <PageHeader
        title={`Order #${order._id?.slice(-6)}`}
        actions={
          <div className="flex gap-2">
            {!['Cancelled', 'Completed', 'Paid'].includes(order.status) && (
              <>
                <Button variant="danger" onClick={() => setShowCancel(true)}>Cancel</Button>
                <Button onClick={() => navigate(`/payments/process/${order._id}`)}>Process Payment</Button>
              </>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="font-semibold mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items?.map((item, i) => (
                <div key={item._id || i} className="flex items-center justify-between py-2 border-b border-slate-200 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.menuItem?.name || 'Item'}</p>
                    <p className="text-xs text-slate-500">Qty: {item.quantity} {item.notes && `- ${item.notes}`}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {updatingItemId === item._id && <Spinner size="sm" />}
                      <select
                        value={item.status}
                        onChange={(e) => handleItemStatusChange(item._id, e.target.value)}
                        disabled={updatingItemId === item._id}
                        className={`text-xs border border-slate-200 rounded px-2 py-1 ${updatingItemId === item._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {ORDER_ITEM_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <p className="font-medium text-sm w-20 text-right">
                      {formatCurrency(item.subtotal || item.menuItem?.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 space-y-1">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(order.totalAmount)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-sm text-red-600"><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div>}
              <div className="flex justify-between font-bold"><span>Total</span><span>{formatCurrency(order.finalAmount || order.totalAmount)}</span></div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card space-y-3">
            <h3 className="font-semibold">Details</h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between"><span className="text-slate-500">Status</span><Badge status={order.status} /></div>
              <div className="flex justify-between"><span className="text-slate-500">Table</span><span>{order.table?.tableNumber ?? '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Customer</span><span>{order.customerName || '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Created</span><span>{formatDateTime(order.createdAt)}</span></div>
              {order.assignedWaiter && (
                <div className="flex justify-between"><span className="text-slate-500">Waiter</span><span>{order.assignedWaiter.firstName} {order.assignedWaiter.lastName}</span></div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Update Status</h3>
              {isUpdatingStatus && <Spinner size="sm" />}
            </div>
            <Select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              options={ORDER_STATUSES.map((s) => ({ value: s, label: s }))}
              disabled={isUpdatingStatus}
            />
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={handleCancel}
        isLoading={isCancelling}
        title="Cancel Order"
        message={
          <div className="space-y-3">
            <p>Are you sure you want to cancel this order?</p>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation"
              className="input"
            />
          </div>
        }
        confirmText="Cancel Order"
      />
    </div>
  );
}
