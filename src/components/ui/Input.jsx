import clsx from 'clsx';

export default function Input({ label, error, className, ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <input className={clsx('input', error && 'border-red-500 focus:ring-red-500', className)} {...props} />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
