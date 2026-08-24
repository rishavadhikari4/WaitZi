import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
import { getAllOrders } from '../../api/orders';
import { getAllTables } from '../../api/tables';
import { getRealTimeStatus } from '../../api/dashboard';
import useAuth from '../../hooks/useAuth';
import usePolling from '../../hooks/usePolling';
import useSocket from '../../hooks/useSocket';
import PageHeader from '../../components/shared/PageHeader';
import StatsCard from '../../components/shared/StatsCard';
import Badge from '../../components/ui/Badge';
import { SkeletonStatCards, SkeletonRows } from '../../components/ui/Skeleton';
import { formatTime, formatCurrency } from '../../utils/formatters';

export default function WaiterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: realTime, refresh: refreshRealTime } = usePolling(() => getRealTimeStatus(), 30000);
  const rtData = realTime?.data || {};

  const fetchData = useCallback(async () => {
    try {
      const [tablesRes, ordersRes] = await Promise.all([
        getAllTables({ limit: 100 }),
        getAllOrders({ limit: 20, sortBy: 'createdAt', sortOrder: 'desc', status: 'Pending' }),
      ]);
      setTables(tablesRes.data || []);
      setOrders(ordersRes.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Slower polling as fallback; socket handles real-time
  usePolling(fetchData, 30000);

  // Socket.IO for instant dashboard updates
  const socketRooms = useMemo(() => ['dashboard'], []);
  const socketEvents = useMemo(() => ({
    'order:new': () => { fetchData(); refreshRealTime(); },
    'order:status-updated': () => { fetchData(); refreshRealTime(); },
    'order:paid': () => { fetchData(); refreshRealTime(); },
    'order:cancelled': () => { fetchData(); refreshRealTime(); },
  }), [fetchData, refreshRealTime]);
  useSocket(socketRooms, socketEvents);

  if (isLoading) {
    return (
      <div>
        <SkeletonStatCards count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card"><SkeletonRows count={4} /></div>
          <div className="card"><SkeletonRows count={5} /></div>
        </div>
      </div>
    );
  }

  const myTables = tables.filter(
    (t) => t.assignedWaiter?._id === user?._id || t.assignedWaiter === user?._id
  );
  const occupiedTables = myTables.filter((t) => t.status === 'Occupied');
  const availableTables = myTables.filter((t) => t.status === 'Available');
  const pendingOrders = orders.filter((o) => o.status === 'Pending');
  const readyOrders = orders.filter((o) => o.status === 'Served' || o.items?.some((i) => i.status === 'Ready'));

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.firstName}`}
        subtitle="Waiter Dashboard"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="My Tables" value={myTables.length} icon="mdi:silverware-fork-knife" subtitle={`${occupiedTables.length} occupied`} />
        <StatsCard title="Available" value={availableTables.length} icon="mdi:check-circle" />
        <StatsCard title="Pending Orders" value={rtData.pendingOrders ?? pendingOrders.length} icon="mdi:clock-outline" />
        <StatsCard title="Active Orders" value={rtData.activeOrders ?? orders.length} icon="mdi:clipboard-list-outline" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Assigned Tables */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">My Tables</h3>
            <button onClick={() => navigate('/tables')} className="text-xs font-medium text-gray-500 hover:text-gray-900">
              View all
            </button>
          </div>
          {myTables.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No tables assigned to you</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {myTables.map((table) => (
                <div
                  key={table._id}
                  onClick={() => navigate('/tables')}
                  className="border border-gray-200 rounded-lg p-3 text-center cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <p className="font-mono font-bold text-lg tabular-nums">T{table.tableNumber}</p>
                  <Badge status={table.status} />
                  <p className="text-xs text-gray-400 mt-1 font-mono">Cap: {table.capacity}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent / Pending Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Recent Orders</h3>
            <button onClick={() => navigate('/orders')} className="text-xs font-medium text-gray-500 hover:text-gray-900">
              View all
            </button>
          </div>
          {orders.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No active orders</p>
          ) : (
            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {orders.slice(0, 10).map((order) => (
                <div
                  key={order._id}
                  onClick={() => navigate(`/orders/${order._id}`)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-200"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      Table {order.table?.tableNumber ?? '?'} — {order.customerName || 'Customer'}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">
                      {order.items?.length ?? 0} items · {formatTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge status={order.status} />
                    <p className="text-xs font-mono font-medium mt-1">{formatCurrency(order.finalAmount || order.totalAmount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ready to Serve Alert */}
      {readyOrders.length > 0 && (
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <h3 className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Icon icon="mdi:check-circle" className="w-3.5 h-3.5" />
            Ready to Serve ({readyOrders.length})
          </h3>
          <div className="space-y-2">
            {readyOrders.map((order) => (
              <div
                key={order._id}
                onClick={() => navigate(`/orders/${order._id}`)}
                className="flex items-center justify-between p-2 bg-white rounded-lg cursor-pointer hover:bg-emerald-50"
              >
                <span className="text-sm font-medium">
                  Table {order.table?.tableNumber ?? '?'} — <span className="font-mono text-gray-500">#{order._id?.slice(-6)}</span>
                </span>
                <Badge status="Ready" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
