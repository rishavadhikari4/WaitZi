import clsx from 'clsx';

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse rounded-md bg-gray-200', className)} />;
}

export function SkeletonStatCards({ count = 4, className = 'grid-cols-2 sm:grid-cols-4' }: { count?: number; className?: string }) {
  return (
    <div className={clsx('grid gap-4 mb-6', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card flex items-center gap-4">
          <Skeleton className="w-11 h-11 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonCardGrid({ count = 6, media = false }: { count?: number; media?: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card space-y-3">
          {media ? (
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <div className="card space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}

export function SkeletonDetail({ avatar = false, rows = 6 }: { avatar?: boolean; rows?: number }) {
  return (
    <div className="card space-y-4">
      {avatar && (
        <div className="flex items-center gap-4 mb-2">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonRows({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-2 rounded-lg border border-gray-200">
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ height = 'h-72' }: { height?: string }) {
  return (
    <div className="card">
      <Skeleton className="h-4 w-40 mb-4" />
      <Skeleton className={clsx('w-full', height)} />
    </div>
  );
}

export function SkeletonTable({ columns = 4, rows = 6 }: { columns?: number; rows?: number }) {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full">
        <tbody className="divide-y divide-gray-100">
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: columns }).map((_, c) => (
                <td key={c} className="px-4 py-3">
                  <Skeleton className="h-4 w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
