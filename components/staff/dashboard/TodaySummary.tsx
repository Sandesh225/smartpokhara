export function TodaySummary({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
        <p className="text-2xl font-bold text-blue-700">{stats.completed_today || 0}</p>
        <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Tasks Done Today</p>
      </div>
      <div className="bg-linear-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
        <p className="text-2xl font-bold text-green-700">{stats.on_time_rate || 0}%</p>
        <p className="text-xs text-green-600 font-medium uppercase tracking-wide">On-Time Rate</p>
      </div>
    </div>
  );
}