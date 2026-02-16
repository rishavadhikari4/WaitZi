import { InboxIcon } from 'lucide-react';

export default function EmptyState({ icon: Icon = InboxIcon, title = 'No data', message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <Icon className="w-12 h-12 mb-4" />
      <p className="text-lg font-medium text-gray-600">{title}</p>
      {message && <p className="text-sm mt-1">{message}</p>}
    </div>
  );
}
