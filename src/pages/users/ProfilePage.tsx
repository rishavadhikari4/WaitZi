import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getProfile, updateProfile } from '../../api/users';
import useAuth from '../../hooks/useAuth';
import PageHeader from '../../components/shared/PageHeader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import FileUpload from '../../components/shared/FileUpload';
import { SkeletonForm } from '../../components/ui/Skeleton';
import type { ApiError } from '../../types/api';

const LETTERS_ONLY = /^[\p{L}\s.'-]+$/u;
const PHONE_RE = /^(\+977)?9[78]\d{8}$/;

export default function ProfilePage() {
  const { setUser } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', number: '', address: '' });
  const [image, setImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getProfile()
      .then((res) => {
        const u = res.data;
        setForm({ firstName: u.firstName || '', lastName: u.lastName || '', email: u.email || '', number: u.number || '', address: u.address || '' });
        setExistingImage(u.image);
      })
      .catch((err) => toast.error((err as ApiError).message || 'Failed to load profile'))
      .finally(() => setIsLoading(false));
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    else if (form.firstName.trim().length < 2) errs.firstName = 'First name must be at least 2 characters';
    else if (!LETTERS_ONLY.test(form.firstName)) errs.firstName = 'First name must contain only letters';

    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    else if (form.lastName.trim().length < 2) errs.lastName = 'Last name must be at least 2 characters';
    else if (!LETTERS_ONLY.test(form.lastName)) errs.lastName = 'Last name must contain only letters';

    if (form.number && !PHONE_RE.test(form.number.replace(/\s/g, '')))
      errs.number = 'Enter a valid Nepali number (e.g. 9812345678 or +9779812345678)';

    if (form.address && form.address.trim().length > 0 && form.address.trim().length < 5)
      errs.address = 'Address must be at least 5 characters';

    return errs;
  };

  const clearError = (field: string) => setErrors((p) => ({ ...p, [field]: '' }));
  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => { setForm({ ...form, [field]: e.target.value }); clearError(field); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setIsSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));
      if (image) formData.append('image', image);
      const res = await updateProfile(formData);
      setUser(res.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error((err as ApiError).message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="max-w-2xl"><SkeletonForm fields={4} /></div>;

  return (
    <div className="max-w-2xl">
      <PageHeader title="My Profile" />
      <form onSubmit={handleSubmit} className="card space-y-4">
        <FileUpload label="Profile Photo" onChange={setImage} preview={existingImage} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" value={form.firstName} onChange={set('firstName')} error={errors.firstName} placeholder="e.g. Ram" />
          <Input label="Last Name" value={form.lastName} onChange={set('lastName')} error={errors.lastName} placeholder="e.g. Sharma" />
        </div>
        <Input label="Email" type="email" value={form.email} onChange={set('email')} disabled />
        <Input label="Phone" value={form.number} onChange={set('number')} error={errors.number} placeholder="e.g. 9812345678" />
        <Input label="Address" value={form.address} onChange={set('address')} error={errors.address} placeholder="e.g. Kathmandu, Nepal" />
        <Button type="submit" isLoading={isSaving}>Save Changes</Button>
      </form>
    </div>
  );
}
