import { InboxIcon } from 'lucide-react';

export default function EmptyState({ icon: Icon = InboxIcon, title = 'No data', message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="bg-slate-100 rounded-full p-4 mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <p className="text-base font-medium text-slate-600">{title}</p>
      {message && <p className="text-sm text-slate-400 mt-1">{message}</p>}
    </div>
  );
}
