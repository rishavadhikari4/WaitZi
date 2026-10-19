import { Icon } from '@iconify/react';
import clsx from 'clsx';

const sizes: Record<'sm' | 'md' | 'lg', string> = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };

export default function Spinner({ size = 'md', className }: { size?: keyof typeof sizes; className?: string }) {
  return <Icon icon="mdi:loading" className={clsx('animate-spin text-blue-600', sizes[size], className)} />;
}
