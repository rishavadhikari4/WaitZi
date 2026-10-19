import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';
import Spinner from './Spinner';

const variants: Record<'primary' | 'secondary' | 'danger' | 'ghost', string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'px-4 py-2 rounded-md text-sm hover:bg-gray-100 transition-colors duration-200 font-medium text-gray-700',
};

const sizes: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'text-sm px-3 py-1.5',
  md: '',
  lg: 'text-lg px-6 py-3',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  isLoading?: boolean;
}) {
  return (
    <button
      className={clsx(variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner size="sm" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
