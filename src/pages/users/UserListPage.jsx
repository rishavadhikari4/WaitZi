import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { getAllUsers, updateUserStatus } from '../../api/users';
import useAuth from '../../hooks/useAuth';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import Pagination from '../../components/shared/Pagination';
import SearchInput from '../../components/shared/SearchInput';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';

export default function UserListPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await getAllUsers(params);
      setUsers(res.data || []);
      setPagination(res.pagination || {});
    } catch (err) {
      toast.error(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateUserStatus(userId, { status: newStatus });
      toast.success(`User ${newStatus === 'Active' ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const columns = [
    {
      key: 'name', label: 'Name', sortable: true, render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
            {row.firstName?.[0]}{row.lastName?.[0]}
          </div>
          <span>{row.firstName} {row.lastName}</span>
        </div>
      )
    },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (row) => <span className="capitalize">{row.role?.name || '-'}</span> },
    {
      key: 'status', label: 'Status', render: (row) => (
        <button onClick={(e) => { e.stopPropagation(); handleToggleStatus(row._id, row.status); }}>
          <Badge status={row.status} />
        </button>
      )
    },
  ];

  const isAdmin = currentUser?.role?.name === 'admin';

  return (
    <div>
      <PageHeader
        title="Staff"
        actions={isAdmin && <Button onClick={() => navigate('/users/new')}><Plus className="w-4 h-4 mr-1" /> Add Staff</Button>}
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
      <DataTable columns={columns} data={users} isLoading={isLoading} onRowClick={(row) => navigate(`/users/${row._id}`)} emptyMessage="No staff found" />
      <Pagination {...pagination} onPageChange={setPage} />
    </div>
  );
}
