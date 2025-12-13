"use client"

import { Card, CardContent } from "@/ui/card"
import { FileText, Clock, Activity, CheckCircle2 } from "lucide-react"

interface DashboardStatsProps {
  totalComplaints: number
  openCount: number
  inProgressCount: number
  resolvedCount: number
}

export default function DashboardStats({
  totalComplaints,
  openCount,
  inProgressCount,
  resolvedCount,
}: DashboardStatsProps) {
  const stats = [
    {
      label: "Total Complaints",
      value: totalComplaints,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-600",
      borderColor: "border-blue-200",
    },
    {
      label: "Open",
      value: openCount,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-gradient-to-br from-amber-50 to-orange-50",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
      borderColor: "border-amber-200",
    },
    {
      label: "In Progress",
      value: inProgressCount,
      icon: Activity,
      color: "text-indigo-600",
      bg: "bg-gradient-to-br from-indigo-50 to-purple-50",
      iconBg: "bg-gradient-to-br from-indigo-500 to-purple-600",
      borderColor: "border-indigo-200",
    },
    {
      label: "Resolved",
      value: resolvedCount,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
      borderColor: "border-emerald-200",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="Complaint statistics">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card
            key={index}
            className={`${stat.borderColor} border-l-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 group overflow-hidden relative focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2`}
          >
            <div
              className={`absolute inset-0 ${stat.bg} opacity-40 group-hover:opacity-60 transition-opacity duration-300`}
            />
            <CardContent className="p-5 relative" role="article" aria-label={`${stat.label}: ${stat.value}`}>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-4xl font-black bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent leading-none">
                    {stat.value}
                  </h3>
                </div>
                <div
                  className={`p-4 rounded-2xl ${stat.iconBg} shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                  aria-hidden="true"
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
