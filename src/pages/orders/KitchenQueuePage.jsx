import { useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
import { getKitchenQueue, updateOrderItemStatus } from '../../api/orders';
import usePolling from '../../hooks/usePolling';
import useSocket from '../../hooks/useSocket';
import PageHeader from '../../components/shared/PageHeader';
import Badge from '../../components/ui/Badge';
import { SkeletonCardGrid } from '../../components/ui/Skeleton';
import { formatTime } from '../../utils/formatters';

export default function KitchenQueuePage() {
  const fetchQueue = useCallback(() => getKitchenQueue(), []);
  const { data, isLoading, refresh } = usePolling(fetchQueue, 30000);

  // Socket.IO for instant kitchen updates
  const socketRooms = useMemo(() => ['kitchen'], []);
  const socketEvents = useMemo(() => ({
    'order:new': () => refresh(),
    'order:status-updated': () => refresh(),
    'order:item-updated': () => refresh(),
    'order:cancelled': () => refresh(),
    'order:items-added': () => refresh(),
  }), [refresh]);
  useSocket(socketRooms, socketEvents);

  const handleItemStatus = async (orderId, itemId, newStatus) => {
    try {
      await updateOrderItemStatus(orderId, itemId, { status: newStatus });
      toast.success(`Item marked as ${newStatus}`);
      refresh();
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    }
  };

  if (isLoading) return <SkeletonCardGrid count={6} />;

  const orders = data?.data || [];

  return (
    <div>
      <PageHeader title="Kitchen Queue" subtitle={`${orders.length} active orders`} />
      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Icon icon="mdi:chef-hat" className="w-12 h-12 mx-auto mb-3" />
          <p>No orders in queue</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map((order) => (
            <div key={order._id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-lg font-bold">Table {order.table?.tableNumber ?? '?'}</span>
                  <span className="text-xs text-gray-400 ml-2">{formatTime(order.createdAt)}</span>
                </div>
                <Badge status={order.status} />
              </div>
              <div className="space-y-2">
                {order.items?.map((item, i) => (
                  <div key={item._id || i} className="flex items-center justify-between py-1.5 border-b border-gray-200 last:border-0">
                    <div>
                      <p className="text-sm font-medium">
                        {item.quantity}x {item.menuItem?.name || 'Item'}
                      </p>
                      {item.notes && <p className="text-xs text-gray-400">{item.notes}</p>}
                    </div>
                    <div className="flex gap-1">
                      {item.status === 'Pending' && (
                        <button
                          onClick={() => handleItemStatus(order._id, item._id || item._id, 'Cooking')}
                          className="p-1.5 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                          title="Start Cooking"
                        >
                          <Icon icon="mdi:chef-hat" className="w-4 h-4" />
                        </button>
                      )}
                      {item.status === 'Cooking' && (
                        <button
                          onClick={() => handleItemStatus(order._id, item._id || item._id, 'Ready')}
                          className="p-1.5 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          title="Mark Ready"
                        >
                          <Icon icon="mdi:check-circle" className="w-4 h-4" />
                        </button>
                      )}
                      {item.status === 'Ready' && (
                        <span className="text-xs text-emerald-600 font-medium px-2 py-1">Ready</span>
                      )}
                      {item.status === 'Pending' && (
                        <Icon icon="mdi:clock-outline" className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {order.note && (
                <p className="text-xs text-gray-500 mt-2 bg-amber-50 p-2 rounded">Note: {order.note}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
