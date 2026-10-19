import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
import { getAllRoles, createRole, updateRole, deleteRole, getPermissionCatalog } from '../../api/roles';
import PageHeader from '../../components/shared/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { SkeletonCardGrid } from '../../components/ui/Skeleton';
import type { ApiError, Role } from '../../types/api';

// Mirrors the sections of the backend permission catalog.
const SECTION: Record<string, string> = {
  org: 'Organization', branch: 'Organization', branding: 'Organization', domain: 'Organization',
  gateway: 'Organization', notification: 'Organization', audit: 'Organization',
  staff: 'People', role: 'People',
  menu: 'Menu and floor', table: 'Menu and floor',
  order: 'Orders and kitchen', kot: 'Orders and kitchen',
  payment: 'Payments', refund: 'Payments', void: 'Payments', discount: 'Payments',
  drawer: 'Payments', invoice: 'Payments', report: 'Payments',
  stock: 'Stock', recipe: 'Stock', supplier: 'Stock', purchase: 'Stock',
};

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form, setForm] = useState<{ name: string; description: string; permissions: string[] }>({ name: '', description: '', permissions: [] });
  const [catalog, setCatalog] = useState<{ key: string; description: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRoles = () => {
    getAllRoles()
      .then((res) => setRoles(res.data || []))
      .catch((err) => toast.error((err as ApiError).message || 'Failed to load roles'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchRoles();
    getPermissionCatalog().then((res) => setCatalog(res.data)).catch(() => {});
  }, []);

  const groups = catalog.reduce<Record<string, { key: string; description: string }[]>>((acc, p) => {
    const prefix = p.key.split('.')[0];
    (acc[SECTION[prefix] ?? prefix] ??= []).push(p);
    return acc;
  }, {});
  const fullAccess = !!editingRole?.permissions.includes('*');
  const togglePermission = (key: string) =>
    setForm((f) => ({ ...f, permissions: f.permissions.includes(key) ? f.permissions.filter((k) => k !== key) : [...f.permissions, key] }));

  const openCreateForm = () => {
    setEditingRole(null);
    setForm({ name: '', description: '', permissions: [] });
    setShowForm(true);
  };

  const openEditForm = (role: Role) => {
    setEditingRole(role);
    setForm({ name: role.name, description: role.description || '', permissions: role.permissions });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Role name is required'); return; }
    setIsSaving(true);
    try {
      if (editingRole) {
        await updateRole(editingRole.id, fullAccess ? { name: form.name, description: form.description } : form);
        toast.success('Role updated');
      } else {
        await createRole(form);
        toast.success('Role created');
      }
      setShowForm(false);
      setForm({ name: '', description: '', permissions: [] });
      setEditingRole(null);
      fetchRoles();
    } catch (err) {
      toast.error((err as ApiError).message || `Failed to ${editingRole ? 'update' : 'create'} role`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (!deleteId) return;
      await deleteRole(deleteId);
      toast.success('Role deleted');
      setDeleteId(null);
      fetchRoles();
    } catch (err) {
      toast.error((err as ApiError).message || 'Failed to delete role');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <SkeletonCardGrid count={6} />;

  return (
    <div>
      <PageHeader title="Roles" actions={<Button onClick={openCreateForm}><Icon icon="mdi:plus" className="w-4 h-4 mr-1" /> Add Role</Button>} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => {
          const isSystem = !!role.isSystem;
          return (
            <div key={role.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold capitalize">{role.name.replace('_', ' ')}</h3>
                  {role.description && <p className="text-sm text-gray-500 mt-1">{role.description}</p>}
                </div>
                {isSystem && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">Built-in</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {role.permissions.includes('*') ? 'Full access' : `${role.permissions.length} permission${role.permissions.length === 1 ? '' : 's'}`}
              </p>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => openEditForm(role)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
                >
                  <Icon icon="mdi:pencil-outline" className="w-3.5 h-3.5" /> Edit
                </button>
                {!isSystem && (
                  <button
                    onClick={() => setDeleteId(role.id)}
                    className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                  >
                    <Icon icon="mdi:trash-can-outline" className="w-3.5 h-3.5" /> Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingRole ? 'Edit Role' : 'Create Role'} size="lg">
        <div className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. head_chef"
            disabled={!!editingRole?.isSystem}
          />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Role description" />
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">Permissions</p>
            {fullAccess ? (
              <p className="text-sm text-gray-500">This role always has full access.</p>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                {Object.entries(groups).map(([group, perms]) => (
                  <fieldset key={group}>
                    <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">{group}</legend>
                    {perms.map((p) => (
                      <label key={p.key} className="flex items-start gap-2 py-1 text-sm text-gray-700">
                        <input type="checkbox" className="mt-0.5" checked={form.permissions.includes(p.key)} onChange={() => togglePermission(p.key)} />
                        <span>{p.description} <code className="text-xs text-gray-400">{p.key}</code></span>
                      </label>
                    ))}
                  </fieldset>
                ))}
              </div>
            )}
          </div>
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
