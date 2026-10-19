import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import type { ApiError, ChooseOrganization } from '../../types/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  // Set when the account works at more than one restaurant.
  const [organizations, setOrganizations] = useState<ChooseOrganization['organizations'] | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address';
    if (!password) errs.password = 'Password is required';
    return errs;
  };

  const signIn = async (organizationId?: string) => {
    setIsLoading(true);
    try {
      const outcome = await login(email, password, organizationId);
      if (outcome.kind === 'choose-organization') {
        setOrganizations(outcome.organizations);
        return;
      }
      toast.success('Login successful');
      navigate(outcome.mustChangePassword ? '/change-password' : '/dashboard');
    } catch (err) {
      toast.error((err as ApiError).message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    void signIn();
  };

  if (organizations) {
    return (
      <div className="space-y-5">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Choose a restaurant</h2>
          <p className="text-sm text-gray-500 mt-1">Your account works at more than one place</p>
        </div>
        <ul className="space-y-2">
          {organizations.map((org) => (
            <li key={org.id}>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => void signIn(org.id)}
                className="w-full flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-left hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50"
              >
                <span>
                  <span className="block font-medium text-gray-900">{org.name}</span>
                  <span className="block text-xs text-gray-500 capitalize">{org.role.replace('_', ' ')}</span>
                </span>
                <Icon icon="mdi:chevron-right" className="w-5 h-5 text-gray-400" />
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => setOrganizations(null)} className="w-full text-sm text-gray-500 hover:text-gray-700">
          Use a different account
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Welcome back</h2>
        <p className="text-sm text-gray-500 mt-1">Sign in to manage your restaurant</p>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <div className="relative">
          <Icon icon="mdi:email-outline" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: '' })); }}
            placeholder="you@restaurant.com"
            className={`input w-full pl-10 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
        </div>
        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <div className="relative">
          <Icon icon="mdi:lock-outline" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: '' })); }}
            placeholder="Enter password"
            className={`input w-full pl-10 pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <Icon icon="mdi:eye-off-outline" width={18} /> : <Icon icon="mdi:eye-outline" width={18} />}
          </button>
        </div>
        {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md shadow-blue-200">
        Sign In
      </Button>

      <p className="text-center text-sm text-gray-500">
        <Link to="/forgot-password" className="text-blue-600 font-medium hover:text-blue-700 hover:underline">
          Forgot password?
        </Link>
      </p>
    </form>
  );
}
