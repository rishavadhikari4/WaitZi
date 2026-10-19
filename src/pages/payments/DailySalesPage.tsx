import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getDailySales } from '../../api/payments';
import PageHeader from '../../components/shared/PageHeader';
import StatsCard from '../../components/shared/StatsCard';
import { SkeletonStatCards, SkeletonChart } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../utils/formatters';
import { PAYMENT_METHOD_COLORS } from '../../utils/constants';
import type { ApiError, DailySalesReport } from '../../types/api';

export default function DailySalesPage() {
  const [data, setData] = useState<DailySalesReport | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true); // eslint-disable-line react-hooks/set-state-in-effect
    getDailySales({ date })
      .then((res) => setData(res.data))
      .catch((err) => toast.error((err as ApiError).message || 'Failed to load sales data'))
      .finally(() => setIsLoading(false));
  }, [date]);

  if (isLoading) {
    return (
      <div>
        <SkeletonStatCards count={3} className="grid-cols-1 sm:grid-cols-3" />
        <SkeletonChart />
      </div>
    );
  }

  const summary = data?.summary;
  const chartData = (data?.paymentMethods ?? []).map((m) => ({ name: m.method || 'Unknown', value: m.total }));

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
        <StatsCard title="Total Sales" value={formatCurrency(summary?.totalSales ?? 0)} icon="mdi:currency-usd" />
        <StatsCard title="Transactions" value={summary?.totalTransactions ?? 0} icon="mdi:credit-card-outline" />
        <StatsCard title="Average" value={formatCurrency(summary?.averageTransaction ?? 0)} icon="mdi:trending-up" />
      </div>

      {chartData.length > 0 && (
        <div className="card">
          <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-4">Payment Method Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={PAYMENT_METHOD_COLORS[entry.name]?.hex || '#9CA3AF'} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => formatCurrency(Number(val))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
