// components/supervisor/DashboardMetrics.tsx
"use client";

import { Activity, AlertTriangle, CheckCircle, Clock, Users, TrendingUp } from "lucide-react";

interface DashboardMetricsProps {
  metrics: any;
  supervisorProfile: any;
}

export default function DashboardMetrics({ metrics, supervisorProfile }: DashboardMetricsProps) {
  const statCards = [
    {
      title: "Active Complaints",
      value: metrics?.active_complaints || 0,
      change: "+12%",
      icon: Activity,
      color: "bg-blue-500",
      trend: "up"
    },
    {
      title: "Overdue",
      value: metrics?.overdue_complaints || 0,
      change: "-5%",
      icon: AlertTriangle,
      color: "bg-red-500",
      trend: "down"
    },
    {
      title: "Resolved Today",
      value: metrics?.resolved_today || 0,
      change: "+18%",
      icon: CheckCircle,
      color: "bg-green-500",
      trend: "up"
    },
    {
      title: "Avg Resolution",
      value: `${Math.round(metrics?.avg_resolution_hours || 0)}h`,
      change: "-2h",
      icon: Clock,
      color: "bg-purple-500",
      trend: "down"
    },
    {
      title: "Unassigned",
      value: metrics?.unassigned_complaints || 0,
      change: "+3",
      icon: Users,
      color: "bg-yellow-500",
      trend: "up"
    },
    {
      title: "SLA Compliance",
      value: `${metrics?.sla_compliance || 0}%`,
      change: "+4%",
      icon: TrendingUp,
      color: "bg-indigo-500",
      trend: "up"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.title} className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
            <div className="mt-3 flex items-center">
              <span className={`text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">from yesterday</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}