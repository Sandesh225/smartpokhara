"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Clock,
  Activity,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardStatsProps {
  totalComplaints: number;
  openCount: number;
  inProgressCount: number;
  resolvedCount: number;
  onStatClick?: (status: string) => void;
}

export default function DashboardStats({
  totalComplaints,
  openCount,
  inProgressCount,
  resolvedCount,
  onStatClick,
}: DashboardStatsProps) {
  // UX: Define the "Mental Model" for each status
  const stats = [
    {
      id: "all",
      label: "Total Complaints",
      value: totalComplaints,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      description: "All issues you have reported to the municipality.",
    },
    {
      id: "open",
      label: "Open",
      value: openCount,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
      description: "Submitted but waiting for staff assignment.",
      warning: openCount > 5, // UX: Soft warning state
    },
    {
      id: "in_progress",
      label: "In Progress",
      value: inProgressCount,
      icon: Activity,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      description: "City staff are currently working on resolution.",
    },
    {
      id: "resolved",
      label: "Resolved",
      value: resolvedCount,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      description: "Successfully completed and closed.",
    },
  ];

  return (
    <TooltipProvider>
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        role="region"
        aria-label="Complaint statistics"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Tooltip key={stat.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onStatClick?.(stat.id)}
                  className={`
                    relative w-full text-left group transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-xl
                  `}
                >
                  <Card
                    className={`
                    border-l-4 shadow-sm hover:shadow-md transition-all h-full
                    ${
                      stat.id === "open"
                        ? "border-l-amber-400"
                        : stat.id === "in_progress"
                          ? "border-l-indigo-400"
                          : stat.id === "resolved"
                            ? "border-l-emerald-400"
                            : "border-l-blue-400"
                    }
                  `}
                  >
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <div className={`p-2 rounded-lg ${stat.bg}`}>
                          <Icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        {/* UX: Hover affordance */}
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                          {stat.label}
                          {stat.warning && (
                            <AlertCircle className="w-3 h-3 text-amber-500 animate-pulse" />
                          )}
                        </p>
                        <h3 className="text-3xl font-black text-gray-900 leading-none">
                          {stat.value}
                        </h3>
                        {stat.warning && (
                          <p className="text-[10px] text-amber-600 font-medium pt-1">
                            Requires attention
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px] text-xs">
                <p>{stat.description}</p>
                <p className="mt-1 text-gray-400 italic">
                  Click to view details
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}