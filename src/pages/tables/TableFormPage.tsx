import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createTable, getTable, updateTable } from '../../api/tables';
import { getAllUsers } from '../../api/users';
import PageHeader from '../../components/shared/PageHeader';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { SkeletonForm } from '../../components/ui/Skeleton';
import type { ApiError, User } from '../../types/api';
import { can } from '../../utils/permissions';

export default function TableFormPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({ tableNumber: '', capacity: '', assignedWaiter: '' });
  const [waiters, setWaiters] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);

  useEffect(() => {
    getAllUsers({ limit: 100 })
      .then((res) => {
        // Anyone who can serve orders can own a table.
        const w = res.data.filter((u) => can(u, 'order.serve'));
        setWaiters(w);
      })
      .catch(() => {});

    if (isEdit) {
      getTable(id)
        .then((res) => {
          const table = res.data;
          setForm({
            tableNumber: String(table.tableNumber ?? ''),
            capacity: String(table.capacity ?? ''),
            assignedWaiter: table.assignedWaiter?.id ?? table.assignedWaiterId ?? '',
          });
        })
        .catch((err) => toast.error((err as ApiError).message || 'Failed to load table'))
        .finally(() => setIsFetching(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = {
        tableNumber: Number(form.tableNumber),
        capacity: Number(form.capacity),
        assignedWaiter: form.assignedWaiter || undefined,
      };

      if (isEdit) {
        await updateTable(id, data);
        toast.success('Table updated');
      } else {
        await createTable(data);
        toast.success('Table created');
      }
      navigate('/tables');
    } catch (err) {
      toast.error((err as ApiError).message || 'Failed to save table');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div className="max-w-md"><SkeletonForm fields={3} /></div>;

  return (
    <div className="max-w-md">
      <PageHeader title={isEdit ? 'Edit Table' : 'Add Table'} />
      <form onSubmit={handleSubmit} className="card space-y-4">
        <Input label="Table Number" type="number" min="1" max="999" value={form.tableNumber} onChange={(e) => setForm({ ...form, tableNumber: e.target.value })} required />
        <Input label="Capacity" type="number" min="1" max="20" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required />
        <Select
          label="Assigned Waiter"
          value={form.assignedWaiter}
          onChange={(e) => setForm({ ...form, assignedWaiter: e.target.value })}
          placeholder="Select waiter (optional)"
          options={waiters.map((w) => ({ value: w.id, label: `${w.firstName} ${w.lastName}` }))}
        />
        <div className="flex gap-3 pt-2">
          <Button type="submit" isLoading={isLoading}>{isEdit ? 'Update' : 'Create'}</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/tables')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
