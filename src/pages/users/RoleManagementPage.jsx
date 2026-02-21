import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getAllRoles, createRole, updateRole, deleteRole } from '../../api/roles';
import PageHeader from '../../components/shared/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Spinner from '../../components/ui/Spinner';

export default function RoleManagementPage() {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const systemRoles = ['admin'];

  const fetchRoles = () => {
    getAllRoles()
      .then((res) => setRoles(res.data || []))
      .catch((err) => toast.error(err.message || 'Failed to load roles'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchRoles(); }, []);

  const openCreateForm = () => {
    setEditingRole(null);
    setForm({ name: '', description: '' });
    setShowForm(true);
  };

  const openEditForm = (role) => {
    setEditingRole(role);
    setForm({ name: role.name, description: role.description || '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Role name is required'); return; }
    setIsSaving(true);
    try {
      if (editingRole) {
        await updateRole(editingRole._id, form);
        toast.success('Role updated');
      } else {
        await createRole(form);
        toast.success('Role created');
      }
      setShowForm(false);
      setForm({ name: '', description: '' });
      setEditingRole(null);
      fetchRoles();
    } catch (err) {
      toast.error(err.message || `Failed to ${editingRole ? 'update' : 'create'} role`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteRole(deleteId);
      toast.success('Role deleted');
      setDeleteId(null);
      fetchRoles();
    } catch (err) {
      toast.error(err.message || 'Failed to delete role');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <PageHeader title="Roles" actions={<Button onClick={openCreateForm}><Plus className="w-4 h-4 mr-1" /> Add Role</Button>} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => {
          const isSystem = systemRoles.includes(role.name);
          return (
            <div key={role._id || role.name} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold capitalize">{role.name}</h3>
                  {role.description && <p className="text-sm text-slate-500 mt-1">{role.description}</p>}
                </div>
                {isSystem && (
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">System</span>
                )}
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                <button
                  onClick={() => openEditForm(role)}
                  className="flex items-center gap-1 text-sm text-black hover:underline"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                {!isSystem && (
                  <button
                    onClick={() => setDeleteId(role._id)}
                    className="flex items-center gap-1 text-sm text-red-600 hover:underline"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingRole ? 'Edit Role' : 'Create Role'} size="sm">
        <div className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. chef"
            disabled={editingRole && systemRoles.includes(editingRole.name)}
          />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Role description" />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} isLoading={isSaving}>{editingRole ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Role"
        message="Are you sure you want to delete this role? Users assigned to this role must be reassigned first."
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}
