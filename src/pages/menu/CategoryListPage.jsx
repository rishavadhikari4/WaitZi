import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getCategories, deleteCategory } from '../../api/categories';
import useAuth from '../../hooks/useAuth';
import PageHeader from '../../components/shared/PageHeader';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Badge from '../../components/ui/Badge';

export default function CategoryListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role?.name === 'admin';
  const isManager = user?.role?.name === 'manager';
  const canManage = isAdmin || isManager;
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = useCallback(() => {
    setIsLoading(true);
    getCategories()
      .then((res) => setCategories(res.data || []))
      .catch((err) => toast.error(err.message || 'Failed to load categories'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCategory(deleteId);
      toast.success('Category deleted');
      setDeleteId(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <PageHeader title="Categories" actions={canManage && <Button onClick={() => navigate('/categories/new')}><Plus className="w-4 h-4 mr-1" /> Add Category</Button>} />
      {categories.length === 0 ? (
        <p className="text-center text-gray-400 py-10">No categories yet</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="card">
              <div className="flex items-center gap-4">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xl font-bold flex-shrink-0">
                    {cat.name?.[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{cat.name}</h3>
                    {cat.isActive === false && <Badge status="Inactive" />}
                  </div>
                  {cat.description && <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{cat.description}</p>}
                </div>
              </div>
              {canManage && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-[#E5E5E5]">
                  <button
                    onClick={() => navigate(`/categories/${cat._id}/edit`)}
                    className="flex items-center gap-1 text-sm text-black hover:underline"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(cat._id)}
                    className="flex items-center gap-1 text-sm text-red-600 hover:underline"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? Menu items in this category will not be deleted."
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}
