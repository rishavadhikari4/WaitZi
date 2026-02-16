import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllOrders } from '../../api/orders';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import Pagination from '../../components/shared/Pagination';
import SearchInput from '../../components/shared/SearchInput';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import { formatDateTime, formatCurrency } from '../../utils/formatters';
import { ORDER_STATUSES } from '../../utils/constants';

export default function OrderListPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 20, sortBy, sortOrder };
      if (status) params.status = status;
      if (search) params.search = search;
      const res = await getAllOrders(params);
      setOrders(res.data || []);
      setPagination(res.pagination || {});
    } catch (err) {
      toast.error(err.message || 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [page, status, search, sortBy, sortOrder]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const columns = [
    { key: 'id', label: 'Order ID', render: (row) => <span className="font-mono text-xs">#{row._id?.slice(-6)}</span> },
    { key: 'table', label: 'Table', render: (row) => row.table?.tableNumber ?? '-' },
    { key: 'customerName', label: 'Customer', sortable: true },
    { key: 'items', label: 'Items', render: (row) => row.items?.length ?? 0 },
    { key: 'finalAmount', label: 'Amount', sortable: true, render: (row) => formatCurrency(row.finalAmount || row.totalAmount) },
    { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} /> },
    { key: 'createdAt', label: 'Created', sortable: true, render: (row) => formatDateTime(row.createdAt) },
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
