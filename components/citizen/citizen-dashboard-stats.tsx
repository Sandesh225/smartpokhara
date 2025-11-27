"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, AlertCircle, CheckCircle, Clock } from "lucide-react"

interface CitizenDashboardStatsProps {
  complaints: any[]
}

export function CitizenDashboardStats({ complaints }: CitizenDashboardStatsProps) {
  const stats = {
    total: complaints.length,
    pending: complaints.filter((c: any) => ["submitted", "received", "assigned"].includes(c.status)).length,
    inProgress: complaints.filter((c: any) => c.status === "in_progress").length,
    resolved: complaints.filter((c: any) => ["resolved", "closed"].includes(c.status)).length,
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-600">Total Complaints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-slate-900">{stats.pending}</div>
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-600">In Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-slate-900">{stats.inProgress}</div>
            <Clock className="h-5 w-5 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-600">Resolved</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-slate-900">{stats.resolved}</div>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
