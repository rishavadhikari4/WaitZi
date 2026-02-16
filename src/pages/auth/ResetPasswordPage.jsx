import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resetPassword, validateResetToken } from '../../api/password';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
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
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
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
      <Input
        label="New Password"
        type="password"
        value={form.newPassword}
        onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        required
      />
      <Input
        label="Confirm Password"
        type="password"
        value={form.confirmPassword}
        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
        required
      />
      <Button type="submit" isLoading={isLoading} className="w-full">
        Reset Password
      </Button>
      <p className="text-center text-sm">
        <Link to="/login" className="text-black hover:underline">Back to login</Link>
      </p>
    </form>
  );
}
