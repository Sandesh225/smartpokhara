import { CheckCircle2, TrendingUp, Clock, Star, BarChart3 } from "lucide-react";

interface DashboardStats {
  completed_today: number;
  totalCompleted: number; // Monthly total
  slaCompliance: number;
  avgResolutionTime: number;
  avgRating: number;
}

export function TodaySummary({ stats }: { stats: DashboardStats }) {
  const metrics = [
    {
      label: "Completed Today",
      value: stats.completed_today || 0,
      sub: "Tasks",
      icon: CheckCircle2,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      label: "Monthly Total",
      value: stats.totalCompleted || 0,
      sub: "Tasks Done",
      icon: BarChart3,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100",
    },
    {
      label: "SLA Score",
      value: `${stats.slaCompliance || 0}%`,
      sub: "On Time",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-100",
    },
    {
      label: "Avg Rating",
      value: stats.avgRating ? stats.avgRating.toFixed(1) : "5.0",
      sub: "Citizen Feedback",
      icon: Star,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {metrics.map((m) => (
        <div
          key={m.label}
          className={`bg-white rounded-xl border p-4 lg:p-5 flex flex-col justify-between shadow-sm transition-all duration-300 hover:shadow-md ${m.border}`}
        >
          <div className="flex justify-between items-start mb-3">
            <div className={`p-2.5 rounded-lg ${m.bg}`}>
              <m.icon className={`w-5 h-5 ${m.color}`} />
            </div>
            {/* Optional: Add trend indicators here if you have historical data */}
          </div>

          <div>
            <h4 className="text-2xl lg:text-3xl font-bold text-gray-900 tabular-nums tracking-tight">
              {m.value}
            </h4>
            <div className="flex items-center gap-1.5 mt-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {m.label}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
