import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { DollarSign, CreditCard, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getDailySales } from '../../api/payments';
import PageHeader from '../../components/shared/PageHeader';
import StatsCard from '../../components/shared/StatsCard';
import Spinner from '../../components/ui/Spinner';
import { formatCurrency } from '../../utils/formatters';
import { PAYMENT_METHOD_COLORS } from '../../utils/constants';

export default function DailySalesPage() {
  const [data, setData] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getDailySales({ date })
      .then((res) => setData(res.data))
      .catch((err) => toast.error(err.message || 'Failed to load sales data'))
      .finally(() => setIsLoading(false));
  }, [date]);

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const stats = data || {};
  const methodBreakdown = stats.paymentMethodBreakdown || stats.breakdown || [];
  const chartData = Array.isArray(methodBreakdown)
    ? methodBreakdown.map((m) => ({ name: m.method || m.name, value: m.total || m.amount || 0 }))
    : Object.entries(methodBreakdown).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <PageHeader
        title="Daily Sales"
        actions={
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input w-auto"
          />
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatsCard title="Total Sales" value={formatCurrency(stats.totalSales ?? stats.totalAmount ?? 0)} icon={DollarSign} />
        <StatsCard title="Transactions" value={stats.totalTransactions ?? stats.count ?? 0} icon={CreditCard} />
        <StatsCard
          title="Average"
          value={formatCurrency(stats.averageTransaction ?? (stats.totalSales && stats.totalTransactions ? stats.totalSales / stats.totalTransactions : 0))}
          icon={TrendingUp}
        />
      </div>

      {chartData.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-4">Payment Method Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={PAYMENT_METHOD_COLORS[entry.name]?.hex || '#9CA3AF'} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => formatCurrency(val)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
