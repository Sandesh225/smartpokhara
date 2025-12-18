// components/shared/StatCard.tsx
interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
}

export function StatCard({ title, value, description, trend, icon, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-900',
    green: 'from-green-50 to-green-100 border-green-200 text-green-900',
    yellow: 'from-amber-50 to-amber-100 border-amber-200 text-amber-900',
    red: 'from-red-50 to-red-100 border-red-200 text-red-900',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-900',
    indigo: 'from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-900',
  };

  const trendColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
  };

  return (
    <div
      className={`bg-linear-to-br rounded-xl border p-6 ${colorClasses[color]}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {description && (
            <p className="text-sm opacity-70 mt-1">{description}</p>
          )}
          {trend && (
            <p
              className={`text-sm mt-2 flex items-center gap-1 ${trendColors[trend.isPositive ? "positive" : "negative"]}`}
            >
              {trend.isPositive ? "↗" : "↘"} {Math.abs(trend.value)}%
              <span className="text-gray-500 text-xs">from last week</span>
            </p>
          )}
        </div>
        {icon && <div className="text-3xl opacity-70">{icon}</div>}
      </div>
    </div>
  );
}