import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
import { getAllRoles } from '../../api/roles';
import { createUser } from '../../api/users';
import PageHeader from '../../components/shared/PageHeader';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import type { ApiError, Role } from '../../types/api';

const LETTERS_ONLY = /^[\p{L}\s.'-]+$/u;
const PHONE_RE = /^(\+977)?9[78]\d{8}$/;
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

export default function UserFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '', number: '', address: '', role: '',
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    getAllRoles()
      .then((res) => setRoles(res.data || []))
      .catch(() => {});
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    else if (form.firstName.trim().length < 2) errs.firstName = 'First name must be at least 2 characters';
    else if (!LETTERS_ONLY.test(form.firstName)) errs.firstName = 'First name must contain only letters';

    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    else if (form.lastName.trim().length < 2) errs.lastName = 'Last name must be at least 2 characters';
    else if (!LETTERS_ONLY.test(form.lastName)) errs.lastName = 'Last name must contain only letters';

    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address';

    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    else if (!PASSWORD_RE.test(form.password)) errs.password = 'Must include uppercase, lowercase, and a number';

    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm the password';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';

    if (form.number && !PHONE_RE.test(form.number.replace(/\s/g, '')))
      errs.number = 'Enter a valid Nepali number (e.g. 9812345678 or +9779812345678)';

    if (form.address && form.address.trim().length > 0 && form.address.trim().length < 5)
      errs.address = 'Address must be at least 5 characters';

    if (!form.role) errs.role = 'Role is required';

    return errs;
  };

  const clearError = (field: string) => setErrors((p) => ({ ...p, [field]: '' }));
  type Field = keyof typeof form;
  const set = (field: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setForm({ ...form, [field]: e.target.value }); clearError(field); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setIsLoading(true);
    try {
      // The API takes the role's id (or name) in this organization.
      await createUser(form);
      toast.success('Staff member created');
      navigate('/users');
    } catch (err) {
      toast.error((err as ApiError).message || 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Register Staff" subtitle="Create an account for someone on your team" />
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" value={form.firstName} onChange={set('firstName')} error={errors.firstName} placeholder="e.g. Ram" />
          <Input label="Last Name" value={form.lastName} onChange={set('lastName')} error={errors.lastName} placeholder="e.g. Sharma" />
        </div>
        <Input label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email} placeholder="you@example.com" />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={set('password')}
              placeholder="Min 8 chars, uppercase, lowercase, number"
              className={`input w-full pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <Icon icon="mdi:eye-off-outline" width={18} /> : <Icon icon="mdi:eye-outline" width={18} />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              placeholder="Re-enter password"
              className={`input w-full pr-10 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <Icon icon="mdi:eye-off-outline" width={18} /> : <Icon icon="mdi:eye-outline" width={18} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
        </div>
        <Input label="Phone" value={form.number} onChange={set('number')} error={errors.number} placeholder="e.g. 9812345678" />
        <Input label="Address" value={form.address} onChange={set('address')} error={errors.address} placeholder="e.g. Kathmandu, Nepal" />
        <Select
          label="Role"
          value={form.role}
          onChange={set('role')}
          placeholder="Select role"
          options={roles.map((r) => ({ value: r.id, label: r.name.replace('_', ' ') }))}
          error={errors.role}
        />
        <div className="flex gap-3 pt-2">
          <Button type="submit" isLoading={isLoading}>Create Staff</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/users')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
