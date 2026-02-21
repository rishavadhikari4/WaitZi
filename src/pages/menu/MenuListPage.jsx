import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { getAllMenuItems, updateMenuAvailability, deleteMenuItem } from '../../api/menu';
import { getCategories } from '../../api/categories';
import useAuth from '../../hooks/useAuth';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import Pagination from '../../components/shared/Pagination';
import SearchInput from '../../components/shared/SearchInput';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatCurrency } from '../../utils/formatters';

export default function MenuListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role?.name === 'admin';
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (category) params.category = category;
      const res = await getAllMenuItems(params);
      setItems(res.data || []);
      setPagination(res.pagination || {});
    } catch (err) {
      toast.error(err.message || 'Failed to load menu');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => {
    getCategories().then((res) => setCategories(res.data || [])).catch(() => {});
  }, []);

  const handleToggleAvailability = async (item) => {
    const newStatus = item.availabilityStatus === 'Available' ? 'Out of Stock' : 'Available';
    try {
      await updateMenuAvailability(item._id, newStatus);
      toast.success(`Marked as ${newStatus}`);
      fetchItems();
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMenuItem(deleteId);
      toast.success('Item deleted');
      setDeleteId(null);
      fetchItems();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const columns = [
    {
      key: 'image', label: '', render: (row) =>
        row.image ? <img src={row.image} alt="" className="w-10 h-10 object-cover rounded" /> : <div className="w-10 h-10 bg-slate-100 rounded" />
    },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'category', label: 'Category', render: (row) => row.category?.name || '-' },
    { key: 'price', label: 'Price', sortable: true, render: (row) => formatCurrency(row.price) },
    {
      key: 'availabilityStatus', label: 'Status', render: (row) => (
        <button onClick={(e) => { e.stopPropagation(); handleToggleAvailability(row); }}>
          <Badge status={row.availabilityStatus} />
        </button>
      )
    },
    ...(isAdmin ? [{
      key: 'actions', label: '', render: (row) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => navigate(`/menu/${row._id}/edit`)} className="text-sm text-black hover:underline">Edit</button>
          <button onClick={() => setDeleteId(row._id)} className="text-sm text-red-600 hover:underline">Delete</button>
        </div>
      )
    }] : []),
  ];

  return (
    <div>
      <PageHeader title="Menu Items" actions={isAdmin && <Button onClick={() => navigate('/menu/new')}><Plus className="w-4 h-4 mr-1" /> Add Item</Button>} />
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput onSearch={(v) => { setSearch(v); setPage(1); }} placeholder="Search menu..." className="flex-1" />
        <Select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          placeholder="All Categories"
          options={categories.map((c) => ({ value: c._id, label: c.name }))}
          className="w-full sm:w-48"
        />
      </div>
      <DataTable columns={columns} data={items} isLoading={isLoading} emptyMessage="No menu items" />
      <Pagination {...pagination} onPageChange={setPage} />
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Item" message="Are you sure you want to delete this menu item?" confirmText="Delete" />
    </div>
  );
}
