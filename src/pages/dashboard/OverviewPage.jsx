import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ShoppingBag, DollarSign, Users, UtensilsCrossed } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getDashboardOverview } from '../../api/dashboard';
import StatsCard from '../../components/shared/StatsCard';
import PageHeader from '../../components/shared/PageHeader';
import Spinner from '../../components/ui/Spinner';
import { formatCurrency } from '../../utils/formatters';
import { DASHBOARD_PERIODS } from '../../utils/constants';

export default function OverviewPage() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('today');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const res = await getDashboardOverview({ period });
        setData(res.data);
      } catch (err) {
        toast.error(err.message || 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [period]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const stats = data?.stats || data || {};
  const salesTrends = data?.analytics?.salesTrends || data?.salesTrends || [];
  const popularItems = data?.analytics?.popularItems || data?.popularItems || [];

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
                  period === p ? 'bg-black text-white' : 'text-gray-600 hover:text-black'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Orders" value={stats.totalOrders ?? 0} icon={ShoppingBag} />
        <StatsCard title="Revenue" value={formatCurrency(stats.totalRevenue ?? 0)} icon={DollarSign} />
        <StatsCard title="Active Tables" value={stats.occupiedTables ?? stats.activeTables ?? 0} icon={UtensilsCrossed} />
        <StatsCard title="Staff On Duty" value={stats.staffOnDuty ?? stats.totalStaff ?? 0} icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Sales Trend</h3>
          {salesTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={salesTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#000" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-10">No data available</p>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Popular Items</h3>
          {popularItems.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={popularItems.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-10">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
