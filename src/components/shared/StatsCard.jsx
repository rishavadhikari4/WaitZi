export default function StatsCard({ title, value, icon: Icon, subtitle }) {
  return (
    <div className="card flex items-center gap-4">
      {Icon && (
        <div className="flex-shrink-0 p-3 bg-gray-100 rounded-lg">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
