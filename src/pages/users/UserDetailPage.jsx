import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getUser, updateUserStatus, deleteUser } from '../../api/users';
import { generateTempPassword } from '../../api/password';
import useAuth from '../../hooks/useAuth';
import PageHeader from '../../components/shared/PageHeader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatDateTime } from '../../utils/formatters';

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role?.name === 'admin';
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);
  const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const res = await getUser(id);
      setUser(res.data);
    } catch (err) {
      toast.error(err.message || 'Failed to load user');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const handleToggleStatus = async () => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    setIsTogglingStatus(true);
    try {
      await updateUserStatus(id, { status: newStatus });
      toast.success('Status updated');
      fetchUser();
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleGenerateTempPassword = async () => {
    setIsGeneratingPassword(true);
    try {
      const res = await generateTempPassword(id);
      setTempPassword(res.data?.temporaryPassword || res.data?.password);
      toast.success('Temporary password generated');
    } catch (err) {
      toast.error(err.message || 'Failed to generate password');
    } finally {
      setIsGeneratingPassword(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteUser(id);
      toast.success('User deleted');
      navigate('/users');
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!user) return <p className="text-center py-20 text-slate-500">User not found</p>;

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={`${user.firstName} ${user.lastName}`}
        actions={
          <div className="flex gap-2">
            <Button variant={user.status === 'Active' ? 'danger' : 'primary'} onClick={handleToggleStatus} isLoading={isTogglingStatus}>
              {user.status === 'Active' ? 'Deactivate' : 'Activate'}
            </Button>
            {isAdmin && user.role?.name !== 'admin' && (
              <>
                <Button variant="secondary" onClick={handleGenerateTempPassword} isLoading={isGeneratingPassword}>
                  Temp Password
                </Button>
                <Button variant="danger" onClick={() => setShowDelete(true)}>
                  Delete
                </Button>
              </>
            )}
          </div>
        }
      />
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          {user.image ? (
            <img src={user.image} alt="" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
            <p className="text-slate-500 capitalize">{user.role?.name}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-slate-500">Email</span><p className="font-medium mt-1">{user.email}</p></div>
          <div><span className="text-slate-500">Phone</span><p className="font-medium mt-1">{user.number || '-'}</p></div>
          <div><span className="text-slate-500">Address</span><p className="font-medium mt-1">{user.address || '-'}</p></div>
          <div><span className="text-slate-500">Status</span><div className="mt-1"><Badge status={user.status} /></div></div>
          <div><span className="text-slate-500">Joined</span><p className="font-medium mt-1">{formatDateTime(user.createdAt)}</p></div>
        </div>
      </div>

      {tempPassword && (
        <div className="card mt-6 border-2 border-green-200 bg-green-50">
          <h3 className="font-semibold mb-2">Temporary Password Generated</h3>
          <p className="text-sm text-slate-600 mb-2">Share this password with the user. They will be required to change it on first login.</p>
          <div className="flex items-center gap-2">
            <code className="bg-white px-3 py-2 rounded border border-green-300 font-mono text-sm flex-1">{tempPassword}</code>
            <Button
              variant="secondary"
              onClick={() => { navigator.clipboard.writeText(tempPassword); toast.success('Copied to clipboard'); }}
            >
              Copy
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}
