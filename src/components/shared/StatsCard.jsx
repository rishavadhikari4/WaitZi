export default function StatsCard({ title, value, icon: Icon, subtitle, compact }) {
  if (compact) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 flex items-center gap-2.5 shadow-sm">
        {Icon && <Icon className="w-4 h-4 text-indigo-500 flex-shrink-0" />}
        <div className="min-w-0">
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide truncate">{title}</p>
          <p className="text-base font-semibold text-slate-900 leading-tight">{value}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card flex items-center gap-4">
      {Icon && (
        <div className="flex-shrink-0 p-3 bg-indigo-50 rounded-lg">
          <Icon className="w-5 h-5 text-indigo-600" />
        </div>
      )}
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
