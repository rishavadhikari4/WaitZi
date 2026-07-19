import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
import { resetPassword, validateResetToken } from '../../api/password';
import Button from '../../components/ui/Button';
import { SkeletonForm } from '../../components/ui/Skeleton';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    validateResetToken(token)
      .then(() => setIsTokenValid(true))
      .catch(() => {
        setIsTokenValid(false);
        toast.error('Invalid or expired reset link');
      })
      .finally(() => setIsValidating(false));
  }, [token]);

  const validate = () => {
    const errs = {};
    if (!form.newPassword) errs.newPassword = 'New password is required';
    else if (form.newPassword.length < 6) errs.newPassword = 'Password must be at least 6 characters';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password';
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
      await resetPassword({ token, ...form });
      toast.success('Password reset successful');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return <SkeletonForm fields={2} />;
  }

  if (!isTokenValid) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">Invalid Reset Link</h2>
        <p className="text-gray-500">This password reset link is invalid or has expired.</p>
        <Link to="/forgot-password" className="text-black hover:underline text-sm">
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-center">Reset Password</h2>

      {/* New Password */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">New Password</label>
        <div className="relative">
          <input
            type={showNew ? 'text' : 'password'}
            value={form.newPassword}
            onChange={(e) => { setForm({ ...form, newPassword: e.target.value }); if (errors.newPassword) setErrors((p) => ({ ...p, newPassword: '' })); }}
            placeholder="Enter new password"
            className={`input w-full pr-10 ${errors.newPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
          <button type="button" onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
            {showNew ? <Icon icon="mdi:eye-off-outline" width={18} /> : <Icon icon="mdi:eye-outline" width={18} />}
          </button>
        </div>
        {errors.newPassword && <p className="text-sm text-red-600">{errors.newPassword}</p>}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
        <div className="relative">
          <input
            type={showConfirm ? 'text' : 'password'}
            value={form.confirmPassword}
            onChange={(e) => { setForm({ ...form, confirmPassword: e.target.value }); if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: '' })); }}
            placeholder="Confirm new password"
            className={`input w-full pr-10 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
            {showConfirm ? <Icon icon="mdi:eye-off-outline" width={18} /> : <Icon icon="mdi:eye-outline" width={18} />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full">
        Reset Password
      </Button>
      <p className="text-center text-sm">
        <Link to="/login" className="text-black hover:underline">Back to login</Link>
      </p>
    </form>
  );
}
