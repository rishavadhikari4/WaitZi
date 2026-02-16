import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import Spinner from '../ui/Spinner';
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
    if (sortBy !== key) return <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-gray-400" />;
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 ml-1" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 ml-1" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data?.length) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <div className="overflow-x-auto border border-[#E5E5E5] rounded-xl">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#E5E5E5] bg-gray-50">
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
        <tbody className="divide-y divide-[#E5E5E5]">
          {data.map((row, i) => (
            <tr
              key={row._id || i}
              className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm">
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
