import clsx from 'clsx';
import type { HTMLAttributes } from 'react';

export default function Card({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('card', className)} {...props}>
      {children}
    </div>
  );
}
