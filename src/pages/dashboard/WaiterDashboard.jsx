import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ClipboardList, UtensilsCrossed, Clock, CheckCircle2 } from 'lucide-react';
import { getAllOrders } from '../../api/orders';
import { getAllTables } from '../../api/tables';
import { getRealTimeStatus } from '../../api/dashboard';
import useAuth from '../../hooks/useAuth';
import usePolling from '../../hooks/usePolling';
import PageHeader from '../../components/shared/PageHeader';
import StatsCard from '../../components/shared/StatsCard';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { formatTime, formatCurrency } from '../../utils/formatters';

export default function WaiterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: realTime } = usePolling(() => getRealTimeStatus(), 15000);
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

  // Poll for fresh orders every 15s
  usePolling(fetchData, 15000);

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
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
        <StatsCard title="My Tables" value={myTables.length} icon={UtensilsCrossed} subtitle={`${occupiedTables.length} occupied`} />
        <StatsCard title="Available" value={availableTables.length} icon={CheckCircle2} />
        <StatsCard title="Pending Orders" value={rtData.pendingOrders ?? pendingOrders.length} icon={Clock} />
        <StatsCard title="Active Orders" value={rtData.activeOrders ?? orders.length} icon={ClipboardList} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Assigned Tables */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">My Tables</h3>
            <button onClick={() => navigate('/tables')} className="text-sm text-gray-500 hover:text-black">
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
                  className="border border-[#E5E5E5] rounded-lg p-3 text-center cursor-pointer hover:bg-gray-50"
                >
                  <p className="font-bold text-lg">T{table.tableNumber}</p>
                  <Badge status={table.status} />
                  <p className="text-xs text-gray-400 mt-1">Cap: {table.capacity}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent / Pending Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Orders</h3>
            <button onClick={() => navigate('/orders')} className="text-sm text-gray-500 hover:text-black">
              View all
            </button>
          </div>
          {orders.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No active orders</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {orders.slice(0, 10).map((order) => (
                <div
                  key={order._id}
                  onClick={() => navigate(`/orders/${order._id}`)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-[#E5E5E5]"
                >
                  <div>
                    <p className="text-sm font-medium">
                      Table {order.table?.tableNumber ?? '?'} - {order.customerName || 'Customer'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {order.items?.length ?? 0} items &middot; {formatTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge status={order.status} />
                    <p className="text-xs font-medium mt-1">{formatCurrency(order.finalAmount || order.totalAmount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ready to Serve Alert */}
      {readyOrders.length > 0 && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
          <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Ready to Serve ({readyOrders.length})
          </h3>
          <div className="space-y-2">
            {readyOrders.map((order) => (
              <div
                key={order._id}
                onClick={() => navigate(`/orders/${order._id}`)}
                className="flex items-center justify-between p-2 bg-white rounded-lg cursor-pointer hover:bg-green-50"
              >
                <span className="text-sm font-medium">
                  Table {order.table?.tableNumber ?? '?'} - #{order._id?.slice(-6)}
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
