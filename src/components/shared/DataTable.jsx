import { Icon } from '@iconify/react';
import { SkeletonTable } from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';

export default function DataTable({
  columns,
  data,
  isLoading,
  emptyMessage = 'No data found',
  sortBy,
  sortOrder,
  onSort,
  onRowClick,
}) {
  const renderSortIcon = (key) => {
    if (!onSort) return null;
    if (sortBy !== key) return <Icon icon="mdi:unfold-more-horizontal" className="w-3.5 h-3.5 ml-1 text-gray-400" />;
    return sortOrder === 'asc' ? (
      <Icon icon="mdi:arrow-up" className="w-3.5 h-3.5 ml-1 text-blue-600" />
    ) : (
      <Icon icon="mdi:arrow-down" className="w-3.5 h-3.5 ml-1 text-blue-600" />
    );
  };

  if (isLoading) {
    return <SkeletonTable columns={columns.length} />;
  }

  if (!data?.length) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/70">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  col.sortable ? 'cursor-pointer select-none hover:text-gray-700' : ''
                }`}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <span className="flex items-center">
                  {col.label}
                  {col.sortable && renderSortIcon(col.key)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row, i) => (
            <tr
              key={row._id || i}
              className={`hover:bg-gray-50/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm text-gray-700">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
