import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
import { getAllTables, updateTableStatus, clearTable, deleteTable } from '../../api/tables';
import useAuth from '../../hooks/useAuth';
import PageHeader from '../../components/shared/PageHeader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import { SkeletonStatCards, SkeletonCardGrid } from '../../components/ui/Skeleton';
import StatsCard from '../../components/shared/StatsCard';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { TABLE_STATUSES } from '../../utils/constants';
import type { ApiError, DiningTable, TableStatus } from '../../types/api';

type TableCounts = { total: number; available: number; occupied: number; reserved: number };
import { can } from '../../utils/permissions';

export default function TableListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = can(user, 'table.manage');
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [stats, setStats] = useState<Partial<TableCounts>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingTableId, setTogglingTableId] = useState<string | null>(null);
  const [clearingTableId, setClearingTableId] = useState<string | null>(null);

  const fetchTables = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { limit: 100 };
      if (filter) params.status = filter;
      const res = await getAllTables(params);
      setTables(res.data || []);
      setStats((res.stats as Partial<TableCounts> | undefined) ?? {});
    } catch (err) {
      toast.error((err as ApiError).message || 'Failed to load tables');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchTables(); }, [fetchTables]);

  const handleStatusChange = async (tableId: string, newStatus: TableStatus) => {
    setTogglingTableId(tableId);
    try {
      await updateTableStatus(tableId, { status: newStatus });
      toast.success('Table status updated');
      fetchTables();
    } catch (err) {
      toast.error((err as ApiError).message || 'Failed to update');
    } finally {
      setTogglingTableId(null);
    }
  };

  const handleClear = async (tableId: string) => {
    setClearingTableId(tableId);
    try {
      await clearTable(tableId);
      toast.success('Table cleared');
      fetchTables();
    } catch (err) {
      toast.error((err as ApiError).message || 'Failed to clear table');
    } finally {
      setClearingTableId(null);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (!deleteId) return;
      await deleteTable(deleteId);
      toast.success('Table deleted');
      setDeleteId(null);
      fetchTables();
    } catch (err) {
      toast.error((err as ApiError).message || 'Failed to delete table');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <SkeletonStatCards count={4} />
        <SkeletonCardGrid count={8} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Tables" actions={canManage && <Button onClick={() => navigate('/tables/new')}><Icon icon="mdi:plus" className="w-4 h-4 mr-1" /> Add Table</Button>} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatsCard title="Total" icon="mdi:table-furniture" value={stats.total ?? tables.length} />
        <StatsCard title="Available" icon="mdi:check-circle-outline" value={stats.available ?? 0} />
        <StatsCard title="Occupied" icon="mdi:account-group-outline" value={stats.occupied ?? 0} />
        <StatsCard title="Reserved" icon="mdi:calendar-clock-outline" value={stats.reserved ?? 0} />
      </div>

      <div className="mb-4">
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="All Statuses"
          options={TABLE_STATUSES.map((s) => ({ value: s, label: s }))}
          className="w-48"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table) => (
          <div key={table.id} className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-mono text-lg font-bold">T{table.tableNumber}</h3>
              <Badge status={table.status} />
            </div>
            <p className="text-sm text-gray-500 mb-1">Capacity: <span className="font-mono">{table.capacity}</span></p>
            {table.assignedWaiter && (
              <p className="text-sm text-gray-500">Waiter: {table.assignedWaiter.firstName} {table.assignedWaiter.lastName}</p>
            )}
            <div className="mt-3 flex gap-2 items-center">
              <div className="flex items-center gap-1 flex-1">
                {togglingTableId === table.id && <Spinner size="sm" />}
                <select
                  value={table.status}
                  onChange={(e) => handleStatusChange(table.id, e.target.value as TableStatus)}
                  disabled={togglingTableId === table.id}
                  className={`text-xs border border-gray-200 rounded px-2 py-1 flex-1 ${togglingTableId === table.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {TABLE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {table.status === 'Occupied' && (
                <button
                  onClick={() => handleClear(table.id)}
                  disabled={clearingTableId === table.id}
                  className={`text-xs text-red-600 hover:underline flex items-center gap-1 ${clearingTableId === table.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {clearingTableId === table.id && <Spinner size="sm" />}
                  Clear
                </button>
              )}
            </div>
            {canManage && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => navigate(`/tables/${table.id}/edit`)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
                >
                  <Icon icon="mdi:pencil-outline" className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => setDeleteId(table.id)}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                >
                  <Icon icon="mdi:trash-can-outline" className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Table"
        message="Are you sure you want to delete this table? This action cannot be undone."
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}
