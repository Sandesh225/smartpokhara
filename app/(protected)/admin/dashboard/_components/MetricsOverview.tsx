import { Card, CardContent } from "@/components/ui/card";
import { AdminDashboardMetrics } from "@/lib/types/admin";
import { AlertCircle, CheckCircle2, DollarSign, Activity } from "lucide-react";

export function MetricsOverview({ metrics }: { metrics: AdminDashboardMetrics }) {
  const items = [
    {
      label: "Total Complaints",
      value: metrics.totalComplaints.toLocaleString(),
      icon: AlertCircle,
      color: "text-blue-600",
      bg: "bg-blue-50",
      ring: "ring-blue-100"
    },
    {
      label: "Resolved",
      value: metrics.resolvedComplaints.toLocaleString(),
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
      ring: "ring-green-100"
    },
    {
      label: "Revenue Collected",
      value: `NPR ${metrics.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      ring: "ring-emerald-100"
    },
    {
      label: "Active Tasks",
      value: metrics.activeTasks.toLocaleString(),
      icon: Activity,
      color: "text-purple-600",
      bg: "bg-purple-50",
      ring: "ring-purple-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <Card 
            key={idx} 
            className="
              relative overflow-hidden border border-gray-200 shadow-sm 
              hover:shadow-lg hover:border-gray-300 
              transition-all duration-300 
              group cursor-pointer
            "
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {item.label}
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
                    {item.value}
                  </h3>
                </div>
                <div 
                  className={`
                    p-3 rounded-xl ${item.bg} ring-2 ${item.ring} ring-offset-2
                    group-hover:scale-110 transition-transform duration-300
                  `}
                >
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
              </div>
            </CardContent>
            
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-linear-to-br from-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </Card>
        );
      })}
    </div>
  );
}