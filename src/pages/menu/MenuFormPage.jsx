import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMenuItem, createMenuItem, updateMenuItem } from '../../api/menu';
import { getCategories } from '../../api/categories';
import PageHeader from '../../components/shared/PageHeader';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import FileUpload from '../../components/shared/FileUpload';
import Spinner from '../../components/ui/Spinner';
import { AVAILABILITY_STATUSES } from '../../utils/constants';

export default function MenuFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', availabilityStatus: 'Available' });
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data || [])).catch(() => {});
    if (isEdit) {
      getMenuItem(id)
        .then((res) => {
          const item = res.data;
          setForm({
            name: item.name || '',
            description: item.description || '',
            price: item.price || '',
            category: item.category?._id || item.category || '',
            availabilityStatus: item.availabilityStatus || 'Available',
          });
          setExistingImage(item.image);
        })
        .catch((err) => toast.error(err.message || 'Failed to load item'))
        .finally(() => setIsFetching(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => { if (val) formData.append(key, val); });
      if (image) formData.append('image', image);

      if (isEdit) {
        await updateMenuItem(id, formData);
        toast.success('Menu item updated');
      } else {
        await createMenuItem(formData);
        toast.success('Menu item created');
      }
      navigate('/menu');
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-2xl">
      <PageHeader title={isEdit ? 'Edit Menu Item' : 'Add Menu Item'} />
      <form onSubmit={handleSubmit} className="card space-y-4">
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <TextArea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <Input label="Price" type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        <Select
          label="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          placeholder="Select category"
          options={categories.map((c) => ({ value: c._id, label: c.name }))}
          required
        />
        <Select
          label="Availability"
          value={form.availabilityStatus}
          onChange={(e) => setForm({ ...form, availabilityStatus: e.target.value })}
          options={AVAILABILITY_STATUSES.map((s) => ({ value: s, label: s }))}
        />
        <FileUpload label="Image" onChange={setImage} preview={existingImage} />
        <div className="flex gap-3 pt-2">
          <Button type="submit" isLoading={isLoading}>{isEdit ? 'Update' : 'Create'}</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/menu')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
