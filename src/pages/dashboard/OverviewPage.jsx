import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { getDashboardOverview, getSalesAnalytics, getOperationalInsights, getMenuAnalytics, getRealTimeStatus } from '../../api/dashboard';
import StatsCard from '../../components/shared/StatsCard';
import PageHeader from '../../components/shared/PageHeader';
import LogoLoader from '../../components/ui/LogoLoader';
import { SkeletonStatCards, SkeletonChart } from '../../components/ui/Skeleton';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { DASHBOARD_PERIODS, PAYMENT_METHOD_COLORS } from '../../utils/constants';
import usePolling from '../../hooks/usePolling';
import useSocket from '../../hooks/useSocket';

const TABS = ['overview', 'sales', 'operations', 'menu'];
const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function OverviewPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [opsData, setOpsData] = useState(null);
  const [menuData, setMenuData] = useState(null);
  const [period, setPeriod] = useState('today');
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Real-time stats strip
  const { data: rtData, refresh: rtRefresh } = usePolling(() => getRealTimeStatus(), 30000);
  const socketRooms = useMemo(() => ['dashboard'], []);
  const socketEvents = useMemo(() => ({
    'order:new': () => rtRefresh(),
    'order:status-updated': () => rtRefresh(),
    'order:item-updated': () => rtRefresh(),
    'order:paid': () => rtRefresh(),
    'order:cancelled': () => rtRefresh(),
    'order:items-added': () => rtRefresh(),
  }), [rtRefresh]);
  useSocket(socketRooms, socketEvents);
  const rt = rtData?.data || {};

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === 'overview') {
          const res = await getDashboardOverview({ period });
          setData(res.data);
        } else if (activeTab === 'sales') {
          const res = await getSalesAnalytics({ period });
          setSalesData(res.data);
        } else if (activeTab === 'operations') {
          const res = await getOperationalInsights({ period });
          setOpsData(res.data);
        } else if (activeTab === 'menu') {
          const res = await getMenuAnalytics({ period });
          setMenuData(res.data);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    };
    fetchData();
  }, [period, activeTab]);

  if (isInitialLoad) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <LogoLoader size="lg" />
      </div>
    );
  }

  // Build stats merging order counts with table/staff from operations
  const orderStats = data?.overview?.orders || {};
  const stats = {
    ...orderStats,
    occupiedTables: data?.operations?.tableStatus?.byStatus?.occupied ?? orderStats.occupiedTables ?? 0,
    staffOnDuty: data?.operations?.staffStats?.active ?? data?.operations?.staffStats?.total ?? 0,
  };

  // Transform salesTrends from { _id:{year,month,day,hour}, totalSales } → { date, total }
  const salesTrends = (data?.analytics?.salesTrends || []).map((item) => {
    const id = item._id || {};
    let date;
    if (id.hour !== undefined) {
      date = `${String(id.hour).padStart(2, '0')}:00`; // hourly → HH:00
    } else if (id.day !== undefined) {
      date = `${String(id.month).padStart(2, '0')}/${String(id.day).padStart(2, '0')}`; // daily → MM/DD
    } else if (id.month !== undefined) {
      date = `${id.year}/${String(id.month).padStart(2, '0')}`; // monthly → YYYY/MM
    } else {
      date = String(id);
    }
    return { date, total: item.totalSales ?? item.total ?? 0 };
  });

  // Transform popularItems: map totalQuantity → count for chart
  const popularItems = (data?.analytics?.popularItems || []).map((item) => ({
    name: item.name || item.menuDetails?.[0]?.name || 'Item',
    count: item.totalQuantity ?? item.orderCount ?? item.count ?? 0,
  }));

  return (
    <div>
      <PageHeader
        title="Dashboard"
        actions={
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {DASHBOARD_PERIODS.slice(0, 4).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-md text-sm capitalize ${
                  period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        }
      />

      {/* Real-time status strip */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Icon icon="mdi:pulse" className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-medium text-gray-700">Live Status</span>
          {rt.lastUpdated && (
            <span className="text-xs text-gray-400">· Updated {formatDateTime(rt.lastUpdated)}</span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatsCard title="Active Orders" value={rt.activeOrders ?? 0} icon="mdi:shopping-outline" compact />
          <StatsCard title="Pending" value={rt.pendingOrders ?? 0} icon="mdi:clock-outline" compact />
          <StatsCard title="Kitchen Queue" value={rt.kitchenQueue ?? 0} icon="mdi:chef-hat" compact />
          <StatsCard title="Available Tables" value={rt.availableTables ?? 0} icon="mdi:silverware-fork-knife" compact />
          <StatsCard title="Occupied Tables" value={rt.occupiedTables ?? 0} icon="mdi:silverware-fork-knife" compact />
          <StatsCard title="Today's Revenue" value={formatCurrency(rt.totalRevenue ?? 0)} icon="mdi:currency-usd" compact />
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm capitalize ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div>
          <SkeletonStatCards count={4} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonChart />
            <SkeletonChart />
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && <OverviewTab stats={stats} salesTrends={salesTrends} popularItems={popularItems} />}
          {activeTab === 'sales' && <SalesTab data={salesData} />}
          {activeTab === 'operations' && <OperationsTab data={opsData} />}
          {activeTab === 'menu' && <MenuTab data={menuData} />}
        </>
      )}
    </div>
  );
}

function OverviewTab({ stats, salesTrends, popularItems }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Orders" value={stats.totalOrders ?? 0} icon="mdi:shopping-outline" />
        <StatsCard title="Revenue" value={formatCurrency(stats.totalRevenue ?? 0)} icon="mdi:currency-usd" />
        <StatsCard title="Active Tables" value={stats.occupiedTables ?? stats.activeTables ?? 0} icon="mdi:silverware-fork-knife" />
        <StatsCard title="Staff On Duty" value={stats.staffOnDuty ?? stats.totalStaff ?? 0} icon="mdi:account-group-outline" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-4">Sales Trend</h3>
          {salesTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={salesTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-10">No data available</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-4">Popular Items</h3>
          {popularItems.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={popularItems.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-10">No data available</p>
          )}
        </div>
      </div>
    </>
  );
}

function SalesTab({ data }) {
  if (!data) return <p className="text-gray-400 text-center py-10">No data available</p>;

  const summary = data.summary || {};
  const paymentMethods = data.breakdowns?.paymentMethods || [];
  const hourly = data.breakdowns?.hourlyDistribution || [];
  const topCustomers = data.customers || [];

  const hourlyFormatted = hourly.map((h) => ({ hour: `${h._id}:00`, total: h.total, count: h.count }));
  const methodsFormatted = paymentMethods.map((m) => ({ name: m._id, value: m.total, count: m.count }));

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatsCard title="Total Sales" value={formatCurrency(summary.totalSales ?? 0)} icon="mdi:currency-usd" />
        <StatsCard title="Transactions" value={summary.totalTransactions ?? 0} icon="mdi:shopping-outline" />
        <StatsCard title="Avg Transaction" value={formatCurrency(summary.averageTransaction ?? 0)} icon="mdi:currency-usd" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-4">Hourly Sales Distribution</h3>
          {hourlyFormatted.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hourlyFormatted}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} interval={1} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="total" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-10">No data available</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-4">Payment Methods</h3>
          {methodsFormatted.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={methodsFormatted} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {methodsFormatted.map((entry, i) => <Cell key={i} fill={PAYMENT_METHOD_COLORS[entry.name]?.hex || PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-10">No data available</p>
          )}
        </div>
      </div>

      {topCustomers.length > 0 && (
        <div className="card">
          <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-4">Top Customers</h3>
          <div className="space-y-2">
            {topCustomers.slice(0, 5).map((c, i) => (
              <div key={i} className="flex justify-between items-center text-sm py-1 border-b border-gray-200 last:border-0">
                <span className="font-medium">{c._id || 'Guest'}</span>
                <div className="flex gap-4 text-gray-500">
                  <span className="font-mono">{c.orderCount} orders</span>
                  <span className="font-mono font-medium text-gray-900">{formatCurrency(c.totalSpent)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function OperationsTab({ data }) {
  if (!data) return <p className="text-gray-400 text-center py-10">No data available</p>;

  const service = data.service || {};
  const kitchen = data.kitchen || {};
  const tables = data.tables || {};
  const staff = data.staff || {};
  const orderDist = data.orders?.statusDistribution || [];
  const avgValue = data.orders?.averageValue ?? 0;

  const tableStatus = tables.byStatus || {};
  const distFormatted = orderDist.map((d) => ({ name: d._id, value: d.count }));

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Active Kitchen Orders" value={kitchen.activeOrders ?? 0} icon="mdi:silverware-fork-knife" />
        <StatsCard title="Cancellation Rate" value={service.cancellationRate ?? '0%'} icon="mdi:shopping-outline" />
        <StatsCard title="Active Staff" value={staff.active ?? 0} icon="mdi:account-group-outline" />
        <StatsCard title="Avg Order Value" value={formatCurrency(avgValue)} icon="mdi:currency-usd" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-4">Order Status Distribution</h3>
          {distFormatted.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={distFormatted} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                  {distFormatted.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-10">No data available</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-4">Table Utilization</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <p className="text-2xl font-mono font-bold tabular-nums">{tableStatus.available ?? 0}</p>
                <p className="text-xs text-gray-500">Available</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-mono font-bold tabular-nums">{tableStatus.occupied ?? 0}</p>
                <p className="text-xs text-gray-500">Occupied</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <p className="text-2xl font-mono font-bold tabular-nums">{tableStatus.reserved ?? 0}</p>
                <p className="text-xs text-gray-500">Reserved</p>
              </div>
            </div>
            {tables.utilization && (
              <div className="text-sm text-gray-600">
                <p>Total Capacity: {tables.utilization.totalCapacity ?? 0} seats</p>
                <p>Occupied: {tables.utilization.occupiedCapacity ?? 0} seats</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-4">Service Metrics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div><span className="text-gray-500">Total Orders</span><p className="font-mono font-semibold text-lg tabular-nums">{service.totalOrders ?? 0}</p></div>
          <div><span className="text-gray-500">Cancelled Orders</span><p className="font-mono font-semibold text-lg tabular-nums">{service.cancelledOrders ?? 0}</p></div>
          <div><span className="text-gray-500">Total Staff</span><p className="font-mono font-semibold text-lg tabular-nums">{staff.total ?? 0}</p></div>
        </div>
      </div>
    </>
  );
}

function MenuTab({ data }) {
  if (!data) return <p className="text-gray-400 text-center py-10">No data available</p>;

  const summary = data.summary || {};
  const topSelling = data.performance?.topSelling || [];
  const underPerforming = data.performance?.underPerforming || [];
  const alerts = data.alerts || [];

  const topFormatted = topSelling.slice(0, 10).map((item) => ({
    name: item.name || item.menuDetails?.[0]?.name || 'Item',
    quantity: item.totalQuantity,
    revenue: item.totalRevenue,
  }));

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatsCard title="Total Items Sold" value={summary.totalItemsSold ?? 0} icon="mdi:shopping-outline" />
        <StatsCard title="Menu Items" value={summary.totalMenuItems ?? 0} icon="mdi:silverware-fork-knife" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-4">Top Selling Items</h3>
          {topFormatted.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topFormatted} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-10">No data available</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-4">Under-Performing Items</h3>
          {underPerforming.length > 0 ? (
            <div className="space-y-2">
              {underPerforming.slice(0, 8).map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm py-1 border-b border-gray-200 last:border-0">
                  <span>{item.name || 'Item'}</span>
                  <span className="text-gray-500">{item.totalQuantity} sold</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-10">No data available</p>
          )}
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="card border-2 border-amber-200 bg-amber-50">
          <h3 className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Icon icon="mdi:alert" className="w-3.5 h-3.5 text-amber-600" /> Out of Stock Items
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {alerts.map((item, i) => (
              <div key={i} className="text-sm bg-white px-3 py-2 rounded border border-amber-200">
                {item.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
