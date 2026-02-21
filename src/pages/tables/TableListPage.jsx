import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getAllTables, updateTableStatus, clearTable, deleteTable } from '../../api/tables';
import useAuth from '../../hooks/useAuth';
import PageHeader from '../../components/shared/PageHeader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import StatsCard from '../../components/shared/StatsCard';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { TABLE_STATUSES } from '../../utils/constants';

export default function TableListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role?.name === 'admin';
  const isManager = user?.role?.name === 'manager';
  const canManage = isAdmin || isManager;
  const [tables, setTables] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTables = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { limit: 100 };
      if (filter) params.status = filter;
      const res = await getAllTables(params);
      setTables(res.data || []);
      setStats(res.stats || {});
    } catch (err) {
      toast.error(err.message || 'Failed to load tables');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchTables(); }, [fetchTables]);

  const handleStatusChange = async (tableId, newStatus) => {
    try {
      await updateTableStatus(tableId, { status: newStatus });
      toast.success('Table status updated');
      fetchTables();
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    }
  };

  const handleClear = async (tableId) => {
    try {
      await clearTable(tableId);
      toast.success('Table cleared');
      fetchTables();
    } catch (err) {
      toast.error(err.message || 'Failed to clear table');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTable(deleteId);
      toast.success('Table deleted');
      setDeleteId(null);
      fetchTables();
    } catch (err) {
      toast.error(err.message || 'Failed to delete table');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <PageHeader title="Tables" actions={canManage && <Button onClick={() => navigate('/tables/new')}><Plus className="w-4 h-4 mr-1" /> Add Table</Button>} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatsCard title="Total" value={stats.totalTables ?? tables.length} />
        <StatsCard title="Available" value={stats.availableTables ?? 0} />
        <StatsCard title="Occupied" value={stats.occupiedTables ?? 0} />
        <StatsCard title="Reserved" value={stats.reservedTables ?? 0} />
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
          <div key={table._id} className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">Table {table.tableNumber}</h3>
              <Badge status={table.status} />
            </div>
            <p className="text-sm text-slate-500 mb-1">Capacity: {table.capacity}</p>
            {table.assignedWaiter && (
              <p className="text-sm text-slate-500">Waiter: {table.assignedWaiter.firstName} {table.assignedWaiter.lastName}</p>
            )}
            <div className="mt-3 flex gap-2">
              <select
                value={table.status}
                onChange={(e) => handleStatusChange(table._id, e.target.value)}
                className="text-xs border border-slate-200 rounded px-2 py-1 flex-1"
              >
                {TABLE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {table.status === 'Occupied' && (
                <button onClick={() => handleClear(table._id)} className="text-xs text-red-600 hover:underline">Clear</button>
              )}
            </div>
            {canManage && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                <button
                  onClick={() => navigate(`/tables/${table._id}/edit`)}
                  className="flex items-center gap-1 text-sm text-black hover:underline"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => setDeleteId(table._id)}
                  className="flex items-center gap-1 text-sm text-red-600 hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
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
