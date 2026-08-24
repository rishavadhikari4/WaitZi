import { useMemo } from 'react';
import { Icon } from '@iconify/react';
import { getRealTimeStatus } from '../../api/dashboard';
import usePolling from '../../hooks/usePolling';
import useSocket from '../../hooks/useSocket';
import { SkeletonStatCards } from '../../components/ui/Skeleton';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

function Tile({ label, value, icon }) {
  return (
    <div className="bg-white/[0.03] rounded-xl p-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.15em]">{label}</p>
        <Icon icon={icon} className="w-4 h-4 text-blue-400/50" />
      </div>
      <p className="font-mono text-4xl font-bold text-gray-50 tabular-nums">{value}</p>
    </div>
  );
}

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
    return <SkeletonStatCards count={7} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />;
  }

  const stats = data?.data || {};

  return (
    <div className="bg-sidebar rounded-2xl p-6 md:p-8 min-h-[70vh]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-50 text-xl font-bold">Live Board</h1>
          {stats.lastUpdated && (
            <p className="text-xs text-gray-500 font-mono mt-1">Updated {formatDateTime(stats.lastUpdated)}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Live</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
        <Tile label="Active Orders" value={stats.activeOrders ?? 0} icon="mdi:shopping-outline" />
        <Tile label="Pending Orders" value={stats.pendingOrders ?? 0} icon="mdi:clock-outline" />
        <Tile label="Kitchen Queue" value={stats.kitchenQueue ?? 0} icon="mdi:chef-hat" />
        <Tile label="Available Tables" value={stats.availableTables ?? 0} icon="mdi:silverware-fork-knife" />
        <Tile label="Occupied Tables" value={stats.occupiedTables ?? 0} icon="mdi:silverware-fork-knife" />
        <Tile label="Today's Revenue" value={formatCurrency(stats.totalRevenue ?? 0)} icon="mdi:currency-usd" />
        <Tile label="Staff On Duty" value={stats.staffOnDuty ?? 0} icon="mdi:account-group-outline" />
      </div>
    </div>
  );
}
