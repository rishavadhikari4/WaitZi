import { useMemo } from 'react';
import { ShoppingBag, Clock, ChefHat, UtensilsCrossed, DollarSign, Users } from 'lucide-react';
import { getRealTimeStatus } from '../../api/dashboard';
import usePolling from '../../hooks/usePolling';
import useSocket from '../../hooks/useSocket';
import StatsCard from '../../components/shared/StatsCard';
import PageHeader from '../../components/shared/PageHeader';
import Spinner from '../../components/ui/Spinner';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export default function RealTimePage() {
  const { data, isLoading, refresh } = usePolling(() => getRealTimeStatus(), 30000);

  // Socket.IO for instant dashboard updates
  const socketRooms = useMemo(() => ['dashboard'], []);
  const socketEvents = useMemo(() => ({
    'order:new': () => refresh(),
    'order:status-updated': () => refresh(),
    'order:item-updated': () => refresh(),
    'order:paid': () => refresh(),
    'order:cancelled': () => refresh(),
    'order:items-added': () => refresh(),
  }), [refresh]);
  useSocket(socketRooms, socketEvents);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const stats = data?.data || {};

  return (
    <div>
      <PageHeader
        title="Real-Time Status"
        subtitle={stats.lastUpdated ? `Updated ${formatDateTime(stats.lastUpdated)}` : undefined}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Active Orders" value={stats.activeOrders ?? 0} icon={ShoppingBag} />
        <StatsCard title="Pending Orders" value={stats.pendingOrders ?? 0} icon={Clock} />
        <StatsCard title="Kitchen Queue" value={stats.kitchenQueue ?? 0} icon={ChefHat} />
        <StatsCard title="Available Tables" value={stats.availableTables ?? 0} icon={UtensilsCrossed} />
        <StatsCard title="Occupied Tables" value={stats.occupiedTables ?? 0} icon={UtensilsCrossed} />
        <StatsCard title="Today's Revenue" value={formatCurrency(stats.totalRevenue ?? 0)} icon="Rs" />
        <StatsCard title="Staff On Duty" value={stats.staffOnDuty ?? 0} icon={Users} />
      </div>
    </div>
  );
}
