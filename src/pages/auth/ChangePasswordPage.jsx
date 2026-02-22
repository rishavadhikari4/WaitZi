import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { changePassword } from '../../api/password';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/shared/PageHeader';

// Defined OUTSIDE the page component so React keeps it stable across renders
function PasswordField({ label, value, showState, onShowToggle, onChange, error, placeholder }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <input
          type={showState ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input w-full pr-10 ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
        />
        <button
          type="button"
          onClick={onShowToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
        >
          {showState ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { mustChangePassword, setMustChangePassword } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, newPwd: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.currentPassword) errs.currentPassword = 'Current password is required';
    if (!form.newPassword) errs.newPassword = 'New password is required';
    else if (form.newPassword.length < 6) errs.newPassword = 'Password must be at least 6 characters';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your new password';
    else if (form.newPassword !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setIsLoading(true);
    try {
      await changePassword(form);
      toast.success('Password changed successfully');
      setMustChangePassword(false);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (field) => setErrors((p) => ({ ...p, [field]: '' }));

  return (
    <div className="max-w-md mx-auto">
      <PageHeader
        title="Change Password"
        subtitle={mustChangePassword ? 'You must change your password before continuing' : undefined}
      />
      <form onSubmit={handleSubmit} className="card space-y-4">
        <PasswordField
          label="Current Password"
          value={form.currentPassword}
          showState={show.current}
          onShowToggle={() => setShow((p) => ({ ...p, current: !p.current }))}
          onChange={(e) => { setForm((p) => ({ ...p, currentPassword: e.target.value })); clearError('currentPassword'); }}
          error={errors.currentPassword}
          placeholder="Enter current password"
        />
        <PasswordField
          label="New Password"
          value={form.newPassword}
          showState={show.newPwd}
          onShowToggle={() => setShow((p) => ({ ...p, newPwd: !p.newPwd }))}
          onChange={(e) => { setForm((p) => ({ ...p, newPassword: e.target.value })); clearError('newPassword'); }}
          error={errors.newPassword}
          placeholder="Enter new password"
        />
        <PasswordField
          label="Confirm New Password"
          value={form.confirmPassword}
          showState={show.confirm}
          onShowToggle={() => setShow((p) => ({ ...p, confirm: !p.confirm }))}
          onChange={(e) => { setForm((p) => ({ ...p, confirmPassword: e.target.value })); clearError('confirmPassword'); }}
          error={errors.confirmPassword}
          placeholder="Confirm new password"
        />
        <Button type="submit" isLoading={isLoading} className="w-full">
          Update Password
        </Button>
      </form>
    </div>
  );
}
