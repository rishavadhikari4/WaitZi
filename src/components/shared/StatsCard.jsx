import { Icon } from '@iconify/react';

export default function StatsCard({ title, value, icon, subtitle, compact }) {
  if (compact) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider truncate">{title}</p>
          {icon && <Icon icon={icon} className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />}
        </div>
        <p className="text-base font-mono font-bold text-gray-900 leading-tight mt-0.5 tabular-nums">{value}</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
        {icon && <Icon icon={icon} className="w-4 h-4 text-gray-300" />}
      </div>
      <p className="text-2xl font-mono font-bold text-gray-900 mt-1.5 tabular-nums">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}
