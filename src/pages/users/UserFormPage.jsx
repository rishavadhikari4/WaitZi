import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register } from '../../api/auth';
import { getAllRoles } from '../../api/roles';
import PageHeader from '../../components/shared/PageHeader';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

export default function UserFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', number: '', address: '', role: '',
  });
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getAllRoles()
      .then((res) => setRoles(res.data || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="max-w-2xl">
      <PageHeader title="Register Staff" subtitle="Admin only - create a new employee account" />
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" value={form.firstName} onChange={set('firstName')} required />
          <Input label="Last Name" value={form.lastName} onChange={set('lastName')} required />
        </div>
        <Input label="Email" type="email" value={form.email} onChange={set('email')} required />
        <Input label="Password" type="password" value={form.password} onChange={set('password')} required />
        <Input label="Phone" value={form.number} onChange={set('number')} />
        <Input label="Address" value={form.address} onChange={set('address')} />
        <Select
          label="Role"
          value={form.role}
          onChange={set('role')}
          placeholder="Select role"
          options={roles.map((r) => ({ value: r._id || r.name, label: r.name }))}
          required
        />
        <div className="flex gap-3 pt-2">
          <Button type="submit" isLoading={isLoading}>Create Staff</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/users')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
