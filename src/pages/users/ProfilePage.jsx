import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getProfile, updateProfile } from '../../api/users';
import useAuth from '../../hooks/useAuth';
import PageHeader from '../../components/shared/PageHeader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import FileUpload from '../../components/shared/FileUpload';
import Spinner from '../../components/ui/Spinner';

export default function ProfilePage() {
  const { setUser } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', number: '', address: '' });
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    console.log('ProfilePage: Loading profile data...');
    getProfile()
      .then((res) => {
        console.log('ProfilePage: Profile data loaded successfully:', res.data);
        const u = res.data;
        setForm({ firstName: u.firstName || '', lastName: u.lastName || '', email: u.email || '', number: u.number || '', address: u.address || '' });
        setExistingImage(u.image);
      })
      .catch((err) => {
        console.error('ProfilePage: Failed to load profile:', err.message, err.status);
        toast.error(err.message || 'Failed to load profile');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));
      if (image) formData.append('image', image);
      const res = await updateProfile(formData);
      setUser(res.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="max-w-2xl">
      <PageHeader title="My Profile" />
      <form onSubmit={handleSubmit} className="card space-y-4">
        <FileUpload label="Profile Photo" onChange={setImage} preview={existingImage} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" value={form.firstName} onChange={set('firstName')} required />
          <Input label="Last Name" value={form.lastName} onChange={set('lastName')} required />
        </div>
        <Input label="Email" type="email" value={form.email} onChange={set('email')} required />
        <Input label="Phone" value={form.number} onChange={set('number')} />
        <Input label="Address" value={form.address} onChange={set('address')} />
        <Button type="submit" isLoading={isSaving}>Save Changes</Button>
      </form>
    </div>
  );
}
