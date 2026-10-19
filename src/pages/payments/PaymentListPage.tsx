import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllPayments } from '../../api/payments';
import PageHeader from '../../components/shared/PageHeader';
import DataTable, { type Column } from '../../components/shared/DataTable';
import Pagination from '../../components/shared/Pagination';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import { formatDateTime, formatCurrency } from '../../utils/formatters';
import { PAYMENT_METHODS, PAYMENT_STATUSES, PAYMENT_METHOD_COLORS } from '../../utils/constants';
import type { ApiError, Pagination as PageInfo, Payment } from '../../types/api';

export default function PaymentListPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<Partial<PageInfo>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [method, setMethod] = useState('');
  const [status, setStatus] = useState('');

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 20, sortBy: 'paymentTime', sortOrder: 'desc' };
      if (method) params.paymentMethod = method;
      if (status) params.paymentStatus = status;
      const res = await getAllPayments(params);
      setPayments(res.data || []);
      setPagination(res.pagination ?? {});
    } catch (err) {
      toast.error((err as ApiError).message || 'Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  }, [page, method, status]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const columns: Column<Payment>[] = [
    { key: 'id', label: 'ID', render: (row) => <span className="font-mono text-xs">#{row.id.slice(-6)}</span> },
    { key: 'order', label: 'Order', render: (row) => <span className="font-mono text-xs">{row.order ? `#${row.order.id.slice(-6)}` : '-'}</span> },
    { key: 'amount', label: 'Amount', render: (row) => <span className="font-mono font-medium">{formatCurrency(row.amount)}</span> },
    { key: 'paymentMethod', label: 'Method', render: (row) => {
      const mc = PAYMENT_METHOD_COLORS[row.paymentMethod];
      return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${mc?.badge || 'bg-gray-100 text-gray-800'}`}>{row.paymentMethod}</span>;
    }},
    { key: 'paymentStatus', label: 'Status', render: (row) => <Badge status={row.paymentStatus} /> },
    { key: 'handledBy', label: 'Handled By', render: (row) => row.handledBy ? `${row.handledBy.firstName} ${row.handledBy.lastName}` : '-' },
    { key: 'paymentTime', label: 'Time', render: (row) => <span className="font-mono text-xs text-gray-500">{row.paymentTime ? formatDateTime(row.paymentTime) : '-'}</span> },
  ];

  return (
    <div>
      <PageHeader title="Payments" />
      <div className="flex gap-3 mb-4">
        <Select value={method} onChange={(e) => { setMethod(e.target.value); setPage(1); }} placeholder="All Methods" options={PAYMENT_METHODS.map((m) => ({ value: m, label: m }))} className="w-40" />
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} placeholder="All Statuses" options={PAYMENT_STATUSES.map((s) => ({ value: s, label: s }))} className="w-40" />
      </div>
      <DataTable columns={columns} data={payments} isLoading={isLoading} onRowClick={(row) => navigate(`/payments/${row._id}`)} emptyMessage="No payments found" />
      <Pagination {...pagination} onPageChange={setPage} />
    </div>
  );
}
