import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllOrders } from '../../api/orders';
import PageHeader from '../../components/shared/PageHeader';
import DataTable, { type Column } from '../../components/shared/DataTable';
import Pagination from '../../components/shared/Pagination';
import SearchInput from '../../components/shared/SearchInput';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import { formatDateTime, formatCurrency } from '../../utils/formatters';
import { ORDER_STATUSES } from '../../utils/constants';
import type { ApiError, Order, Pagination as PageInfo } from '../../types/api';

export default function OrderListPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Partial<PageInfo>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 20, sortBy, sortOrder };
      if (status) params.status = status;
      if (search) params.search = search;
      const res = await getAllOrders(params);
      setOrders(res.data || []);
      setPagination(res.pagination ?? {});
    } catch (err) {
      toast.error((err as ApiError).message || 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [page, status, search, sortBy, sortOrder]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const columns: Column<Order>[] = [
    { key: 'id', label: 'Order ID', render: (row) => <span className="font-mono text-xs">#{row._id?.slice(-6)}</span> },
    { key: 'table', label: 'Table', render: (row) => <span className="font-mono">{row.table?.tableNumber ?? '-'}</span> },
    { key: 'customerName', label: 'Customer', sortable: true },
    { key: 'items', label: 'Items', render: (row) => <span className="font-mono">{row.items?.length ?? 0}</span> },
    {
      key: 'finalAmount',
      label: 'Amount',
      sortable: true,
      render: (row) => <span className="font-mono font-medium">{formatCurrency(row.finalAmount || row.totalAmount)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {row.isPrepaid && row.status !== 'Paid' && (
            <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">Prepaid</span>
          )}
          <Badge status={row.status} />
        </div>
      ),
    },
    { key: 'createdAt', label: 'Created', sortable: true, render: (row) => <span className="font-mono text-xs text-gray-500">{formatDateTime(row.createdAt)}</span> },
  ];

  return (
    <div>
      <PageHeader title="Orders" />
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput onSearch={setSearch} placeholder="Search orders..." className="flex-1" />
        <Select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          placeholder="All Statuses"
          options={ORDER_STATUSES.map((s) => ({ value: s, label: s }))}
          className="w-full sm:w-48"
        />
      </div>
      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onRowClick={(row) => navigate(`/orders/${row._id}`)}
        emptyMessage="No orders found"
      />
      <Pagination {...pagination} onPageChange={setPage} />
    </div>
  );
}
