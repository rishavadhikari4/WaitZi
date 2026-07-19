import { Icon } from '@iconify/react';

export default function StatsCard({ title, value, icon, subtitle, compact }) {
  if (compact) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 flex items-center gap-2.5 shadow-sm">
        {icon && <Icon icon={icon} className="w-4 h-4 text-blue-500 flex-shrink-0" />}
        <div className="min-w-0">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide truncate">{title}</p>
          <p className="text-base font-semibold text-gray-900 leading-tight">{value}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card flex items-center gap-4">
      {icon && (
        <div className="flex-shrink-0 p-3 bg-blue-50 rounded-lg">
          <Icon icon={icon} className="w-5 h-5 text-blue-600" />
        </div>
      )}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
