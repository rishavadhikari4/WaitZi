import clsx from 'clsx';
import type { ReactNode } from 'react';
import { STATUS_COLORS } from '../../utils/constants';

export default function Badge({ children, status, className }: { children?: ReactNode; status?: string; className?: string }) {
  const colorClass = (status && STATUS_COLORS[status]) || 'bg-gray-100 text-gray-800';
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium', colorClass, className)}>
      {children || status}
    </span>
  );
}
