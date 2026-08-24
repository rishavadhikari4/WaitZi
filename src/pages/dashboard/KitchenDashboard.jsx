import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
import { getKitchenQueue, updateOrderItemStatus } from '../../api/orders';
import { getRealTimeStatus } from '../../api/dashboard';
import useAuth from '../../hooks/useAuth';
import usePolling from '../../hooks/usePolling';
import useSocket from '../../hooks/useSocket';
import PageHeader from '../../components/shared/PageHeader';
import StatsCard from '../../components/shared/StatsCard';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { SkeletonStatCards, SkeletonCardGrid } from '../../components/ui/Skeleton';
import { formatTime } from '../../utils/formatters';

export default function KitchenDashboard() {
  const { user } = useAuth();
  const isChef = user?.role?.name === 'chef';
  const roleLabel = isChef ? 'Chef' : 'Kitchen Helper';

  const fetchQueue = useCallback(() => getKitchenQueue(), []);
  const { data: queueData, isLoading: queueLoading, refresh } = usePolling(fetchQueue, 30000);
  const { refresh: refreshRealTime } = usePolling(() => getRealTimeStatus(), 30000);

  // Socket.IO for instant kitchen + dashboard updates
  const socketRooms = useMemo(() => ['kitchen', 'dashboard'], []);
  const socketEvents = useMemo(() => ({
    'order:new': () => { refresh(); refreshRealTime(); },
    'order:status-updated': () => { refresh(); refreshRealTime(); },
    'order:item-updated': () => { refresh(); refreshRealTime(); },
    'order:cancelled': () => { refresh(); refreshRealTime(); },
    'order:items-added': () => { refresh(); refreshRealTime(); },
    'order:paid': () => refreshRealTime(),
  }), [refresh, refreshRealTime]);
  useSocket(socketRooms, socketEvents);

  const [updatingItemId, setUpdatingItemId] = useState(null);

  const orders = queueData?.data || [];

  const pendingItems = orders.reduce((sum, o) => sum + (o.items?.filter((i) => i.status === 'Pending').length || 0), 0);
  const cookingItems = orders.reduce((sum, o) => sum + (o.items?.filter((i) => i.status === 'Cooking').length || 0), 0);
  const readyItems = orders.reduce((sum, o) => sum + (o.items?.filter((i) => i.status === 'Ready').length || 0), 0);

  const handleItemStatus = async (orderId, itemId, newStatus) => {
    setUpdatingItemId(itemId);
    try {
      await updateOrderItemStatus(orderId, itemId, { status: newStatus, cookedBy: user?._id });
      toast.success(`Marked as ${newStatus}`);
      refresh();
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setUpdatingItemId(null);
    }
  };

  if (queueLoading) {
    return (
      <div>
        <SkeletonStatCards count={4} />
        <SkeletonCardGrid count={6} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.firstName}`}
        subtitle={`${roleLabel} Dashboard`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Orders in Queue" value={orders.length} icon="mdi:chef-hat" />
        <StatsCard title="Pending Items" value={pendingItems} icon="mdi:clock-outline" />
        <StatsCard title="Cooking" value={cookingItems} icon="mdi:fire" />
        <StatsCard title="Ready" value={readyItems} icon="mdi:check-circle" />
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Icon icon="mdi:chef-hat" className="w-16 h-16 mx-auto mb-4" />
          <p className="text-lg">Kitchen is clear!</p>
          <p className="text-sm">No orders in queue right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map((order) => {
            const hasPending = order.items?.some((i) => i.status === 'Pending');
            const allReady = order.items?.every((i) => i.status === 'Ready' || i.status === 'Served');
            const railColor = hasPending ? 'bg-amber-400' : allReady ? 'bg-emerald-400' : 'bg-blue-400';
            return (
              <div key={order._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex">
                <div className={`w-1.5 shrink-0 ${railColor}`} />
                <div className="p-4 flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xl font-bold tabular-nums">T{order.table?.tableNumber ?? '?'}</span>
                    <span className="text-xs text-gray-400 font-mono">{formatTime(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge status={order.status} />
                    {order.customerName && <p className="text-sm text-gray-500 truncate">{order.customerName}</p>}
                  </div>

                  <div className="space-y-2">
                    {order.items?.map((item, i) => (
                      <div
                        key={item._id || i}
                        className={`flex items-center justify-between p-2 rounded-lg border-b border-dashed last:border-0 ${
                          item.status === 'Pending'
                            ? 'bg-amber-50 border-amber-100'
                            : item.status === 'Cooking'
                            ? 'bg-blue-50 border-blue-100'
                            : item.status === 'Ready'
                            ? 'bg-emerald-50 border-emerald-100'
                            : 'bg-gray-50 border-gray-100'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            <span className="font-mono font-bold">{item.quantity}×</span> {item.menuItem?.name || 'Item'}
                          </p>
                          {item.notes && (
                            <p className="text-xs text-orange-600 mt-0.5">* {item.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-2 shrink-0">
                          {item.status === 'Pending' && (
                            <button
                              onClick={() => handleItemStatus(order._id, item._id, 'Cooking')}
                              disabled={updatingItemId === item._id}
                              className={`px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 flex items-center gap-1 ${updatingItemId === item._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {updatingItemId === item._id ? <Spinner size="sm" /> : <Icon icon="mdi:fire" className="w-3.5 h-3.5" />} Cook
                            </button>
                          )}
                          {item.status === 'Cooking' && (
                            <button
                              onClick={() => handleItemStatus(order._id, item._id, 'Ready')}
                              disabled={updatingItemId === item._id}
                              className={`px-3 py-1.5 bg-emerald-600 text-white rounded-md text-xs font-medium hover:bg-emerald-700 flex items-center gap-1 ${updatingItemId === item._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {updatingItemId === item._id ? <Spinner size="sm" /> : <Icon icon="mdi:check-circle" className="w-3.5 h-3.5" />} Done
                            </button>
                          )}
                          {item.status === 'Ready' && (
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                              Ready
                            </span>
                          )}
                          {item.status === 'Served' && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                              Served
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.note && (
                    <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-800">Order Note: {order.note}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
