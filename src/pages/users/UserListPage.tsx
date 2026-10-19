import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
import { getAllUsers, updateUserStatus } from '../../api/users';
import useAuth from '../../hooks/useAuth';
import PageHeader from '../../components/shared/PageHeader';
import DataTable, { type Column } from '../../components/shared/DataTable';
import Pagination from '../../components/shared/Pagination';
import SearchInput from '../../components/shared/SearchInput';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import type { ActiveStatus, ApiError, Pagination as PageInfo, User } from '../../types/api';
import { can } from '../../utils/permissions';

export default function UserListPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Partial<PageInfo>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await getAllUsers(params);
      setUsers(res.data || []);
      setPagination(res.pagination ?? {});
    } catch (err) {
      toast.error((err as ApiError).message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleStatus = async (userId: string, currentStatus: ActiveStatus) => {
    const newStatus: ActiveStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setTogglingUserId(userId);
    try {
      await updateUserStatus(userId, { status: newStatus });
      toast.success(`User ${newStatus === 'Active' ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (err) {
      toast.error((err as ApiError).message || 'Failed to update status');
    } finally {
      setTogglingUserId(null);
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'name', label: 'Name', sortable: true, render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center text-xs font-semibold">
            {row.firstName?.[0]}{row.lastName?.[0]}
          </div>
          <span>{row.firstName} {row.lastName}</span>
        </div>
      )
    },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (row) => <span className="capitalize">{row.role?.name.replace('_', ' ') || '-'}</span> },
    {
      key: 'status', label: 'Status', render: (row) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleToggleStatus(row._id, row.status); }}
          disabled={togglingUserId === row._id}
          className={togglingUserId === row._id ? 'opacity-50 cursor-not-allowed' : ''}
        >
          {togglingUserId === row._id ? <Spinner size="sm" /> : <Badge status={row.status} />}
        </button>
      )
    },
  ];

  const canManage = can(currentUser, 'staff.manage');

  return (
    <div>
      <PageHeader
        title="Staff"
        actions={canManage && <Button onClick={() => navigate('/users/new')}><Icon icon="mdi:plus" className="w-4 h-4 mr-1" /> Add Staff</Button>}
      />
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput onSearch={(v) => { setSearch(v); setPage(1); }} placeholder="Search staff..." className="flex-1" />
        <Select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          placeholder="All Statuses"
          options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]}
          className="w-40"
        />
      </div>
      <DataTable columns={columns} data={users} isLoading={isLoading} onRowClick={(row) => navigate(`/users/${row.id}`)} emptyMessage="No staff found" />
      <Pagination {...pagination} onPageChange={setPage} />
    </div>
  );
}
