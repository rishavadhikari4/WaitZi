import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register } from '../../api/auth';
import { getAllRoles } from '../../api/roles';
import PageHeader from '../../components/shared/PageHeader';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

const LETTERS_ONLY = /^[a-zA-Z\s]+$/;
const PHONE_RE = /^(\+977)?9[78]\d{8}$/;
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

export default function UserFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '', number: '', address: '', role: '',
  });
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getAllRoles()
      .then((res) => setRoles(res.data || []))
      .catch(() => {});
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    else if (form.firstName.trim().length < 2) errs.firstName = 'First name must be at least 2 characters';
    else if (!LETTERS_ONLY.test(form.firstName)) errs.firstName = 'First name must contain only letters';

    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    else if (form.lastName.trim().length < 2) errs.lastName = 'Last name must be at least 2 characters';
    else if (!LETTERS_ONLY.test(form.lastName)) errs.lastName = 'Last name must contain only letters';

    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address';

    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
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

  const clearError = (field) => setErrors((p) => ({ ...p, [field]: '' }));
  const set = (field) => (e) => { setForm({ ...form, [field]: e.target.value }); clearError(field); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setIsLoading(true);
    try {
      await register({
        ...form,
        role: roles.find((r) => r._id === form.role)?.name || form.role,
      });
      toast.success('Staff member created');
      navigate('/users');
    } catch (err) {
      toast.error(err.message || 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Register Staff" subtitle="Admin only - create a new employee account" />
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" value={form.firstName} onChange={set('firstName')} error={errors.firstName} placeholder="e.g. Ram" />
          <Input label="Last Name" value={form.lastName} onChange={set('lastName')} error={errors.lastName} placeholder="e.g. Sharma" />
        </div>
        <Input label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email} placeholder="you@example.com" />
        <Input label="Password" type="password" value={form.password} onChange={set('password')} error={errors.password} placeholder="Min 6 chars, uppercase, lowercase, number" />
        <Input label="Confirm Password" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} />
        <Input label="Phone" value={form.number} onChange={set('number')} error={errors.number} placeholder="e.g. 9812345678" />
        <Input label="Address" value={form.address} onChange={set('address')} error={errors.address} placeholder="e.g. Kathmandu, Nepal" />
        <Select
          label="Role"
          value={form.role}
          onChange={set('role')}
          placeholder="Select role"
          options={roles.map((r) => ({ value: r._id || r.name, label: r.name }))}
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
