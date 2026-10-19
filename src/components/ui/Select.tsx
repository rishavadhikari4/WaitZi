import clsx from 'clsx';
import type { SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export default function Select({
  label,
  error,
  options = [],
  placeholder,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string; options?: SelectOption[]; placeholder?: string }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <select className={clsx('input', error && 'border-red-500', className)} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
