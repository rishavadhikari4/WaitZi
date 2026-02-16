import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { Clock, ChefHat, CheckCircle2, Flame } from 'lucide-react';
import { getKitchenQueue, updateOrderItemStatus } from '../../api/orders';
import { getRealTimeStatus } from '../../api/dashboard';
import useAuth from '../../hooks/useAuth';
import usePolling from '../../hooks/usePolling';
import PageHeader from '../../components/shared/PageHeader';
import StatsCard from '../../components/shared/StatsCard';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { formatTime } from '../../utils/formatters';

export default function KitchenDashboard() {
  const { user } = useAuth();
  const isChef = user?.role?.name === 'chef';
  const roleLabel = isChef ? 'Chef' : 'Kitchen Helper';

  const fetchQueue = useCallback(() => getKitchenQueue(), []);
  const { data: queueData, isLoading: queueLoading, refresh } = usePolling(fetchQueue, 8000);
  const { data: realTime } = usePolling(() => getRealTimeStatus(), 15000);

  const orders = queueData?.data || [];
  const rtData = realTime?.data || {};

  const pendingItems = orders.reduce((sum, o) => sum + (o.items?.filter((i) => i.status === 'Pending').length || 0), 0);
  const cookingItems = orders.reduce((sum, o) => sum + (o.items?.filter((i) => i.status === 'Cooking').length || 0), 0);
  const readyItems = orders.reduce((sum, o) => sum + (o.items?.filter((i) => i.status === 'Ready').length || 0), 0);

  const handleItemStatus = async (orderId, itemId, newStatus) => {
    try {
      await updateOrderItemStatus(orderId, itemId, { status: newStatus, cookedBy: user?._id });
      toast.success(`Marked as ${newStatus}`);
      refresh();
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    }
  };

  if (queueLoading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.firstName}`}
        subtitle={`${roleLabel} Dashboard`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Orders in Queue" value={orders.length} icon={ChefHat} />
        <StatsCard title="Pending Items" value={pendingItems} icon={Clock} />
        <StatsCard title="Cooking" value={cookingItems} icon={Flame} />
        <StatsCard title="Ready" value={readyItems} icon={CheckCircle2} />
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <ChefHat className="w-16 h-16 mx-auto mb-4" />
          <p className="text-lg">Kitchen is clear!</p>
          <p className="text-sm">No orders in queue right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map((order) => {
            const hasPending = order.items?.some((i) => i.status === 'Pending');
            const allReady = order.items?.every((i) => i.status === 'Ready' || i.status === 'Served');
            return (
              <div
                key={order._id}
                className={`card border-2 ${
                  hasPending ? 'border-yellow-300' : allReady ? 'border-green-300' : 'border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xl font-bold">Table {order.table?.tableNumber ?? '?'}</span>
                    <Badge status={order.status} className="ml-2" />
                  </div>
                  <span className="text-sm text-gray-400">{formatTime(order.createdAt)}</span>
                </div>

                {order.customerName && (
                  <p className="text-sm text-gray-500 mb-2">{order.customerName}</p>
                )}

                <div className="space-y-2">
                  {order.items?.map((item, i) => (
                    <div
                      key={item._id || item._id || i}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        item.status === 'Pending'
                          ? 'bg-yellow-50'
                          : item.status === 'Cooking'
                          ? 'bg-blue-50'
                          : item.status === 'Ready'
                          ? 'bg-green-50'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          <span className="font-bold">{item.quantity}x</span> {item.menuItem?.name || 'Item'}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-orange-600 mt-0.5">* {item.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {item.status === 'Pending' && (
                          <button
                            onClick={() => handleItemStatus(order._id, item._id || item._id, 'Cooking')}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 flex items-center gap-1"
                          >
                            <Flame className="w-3.5 h-3.5" /> Cook
                          </button>
                        )}
                        {item.status === 'Cooking' && (
                          <button
                            onClick={() => handleItemStatus(order._id, item._id || item._id, 'Ready')}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Done
                          </button>
                        )}
                        {item.status === 'Ready' && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
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
                  <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-xs text-yellow-800">Order Note: {order.note}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
