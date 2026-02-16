import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCategory, createCategory, updateCategory } from '../../api/categories';
import PageHeader from '../../components/shared/PageHeader';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Button from '../../components/ui/Button';
import FileUpload from '../../components/shared/FileUpload';
import Spinner from '../../components/ui/Spinner';

export default function CategoryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({ name: '', description: '' });
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      getCategory(id)
        .then((res) => {
          const cat = res.data;
          setForm({
            name: cat.name || '',
            description: cat.description || '',
          });
          setExistingImage(cat.image);
        })
        .catch((err) => toast.error(err.message || 'Failed to load category'))
        .finally(() => setIsFetching(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      if (form.description) formData.append('description', form.description);
      if (image) formData.append('image', image);

      if (isEdit) {
        await updateCategory(id, formData);
        toast.success('Category updated');
      } else {
        await createCategory(formData);
        toast.success('Category created');
      }
      navigate('/categories');
    } catch (err) {
      toast.error(err.message || 'Failed to save category');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-2xl">
      <PageHeader title={isEdit ? 'Edit Category' : 'Add Category'} />
      <form onSubmit={handleSubmit} className="card space-y-4">
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <TextArea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <FileUpload label="Image" onChange={setImage} preview={existingImage} />
        <div className="flex gap-3 pt-2">
          <Button type="submit" isLoading={isLoading}>{isEdit ? 'Update' : 'Create'}</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/categories')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
