import { Icon } from '@iconify/react';

export default function EmptyState({ icon = 'mdi:inbox-outline', title = 'No data', message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="bg-gray-100 rounded-full p-4 mb-4">
        <Icon icon={icon} className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-base font-medium text-gray-600">{title}</p>
      {message && <p className="text-sm text-gray-400 mt-1">{message}</p>}
    </div>
  );
}
