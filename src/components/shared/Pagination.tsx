import { Icon } from '@iconify/react';

import type { Pagination as PageInfo } from '../../types/api';

/** Spread the API's `pagination` object straight in. */
export default function Pagination({ currentPage = 1, totalPages = 0, totalItems = 0, itemsPerPage = 20, onPageChange }: Partial<PageInfo> & {
  onPageChange: (page: number) => void;
}) {
  if (!totalPages || totalPages <= 1) return null;

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  const pages: number[] = [];
  for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-gray-500">
        Showing {start}-{end} of {totalItems}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
        >
          <Icon icon="mdi:chevron-left" className="w-4 h-4" />
        </button>
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              page === currentPage ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
        >
          <Icon icon="mdi:chevron-right" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
