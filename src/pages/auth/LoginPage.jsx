import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address';
    if (!password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setIsLoading(true);
    try {
      const { mustChangePassword } = await login(email, password);
      toast.success('Login successful');
      navigate(mustChangePassword ? '/change-password' : '/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

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
