"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SupervisorStatsCards } from "@/components/staff/stats-cards"
import { DashboardSkeleton } from "@/components/shared/loading-skeleton"
import { useCurrentUser, useAdminDashboard, useDepartments } from "@/lib/hooks/use-complaints"
import { ArrowRight, UserPlus, Users, AlertTriangle, TrendingUp, BarChart3 } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export default function SupervisorDashboardPage() {
  const { user, loading: userLoading } = useCurrentUser()
  const { departments } = useDepartments()
  const departmentId = user?.department_id || departments[0]?.id || null

  const { analytics, staffWorkload, loading, getOverdueComplaints, getTopPerformers, getCategoryInsights } =
    useAdminDashboard(undefined, undefined, undefined, departmentId || undefined)

  const stats = useMemo(() => {
    if (!analytics) return { totalOpen: 0, unassigned: 0, overdue: 0, escalated: 0 }
    return {
      totalOpen: analytics.summary.total_complaints - analytics.summary.resolved,
      unassigned: analytics.by_status?.submitted || 0,
      overdue: analytics.summary.overdue,
      escalated: analytics.by_status?.escalated || 0,
    }
  }, [analytics])

  const statusData = useMemo(() => {
    if (!analytics?.by_status) return []
    return Object.entries(analytics.by_status).map(([name, value]) => ({
      name: name.replace("_", " ").charAt(0).toUpperCase() + name.replace("_", " ").slice(1),
      value,
    }))
  }, [analytics])

  const categoryData = useMemo(() => {
    return getCategoryInsights().slice(0, 6)
  }, [getCategoryInsights])

  const topPerformers = useMemo(() => {
    return getTopPerformers().slice(0, 5)
  }, [getTopPerformers])

  if (userLoading || loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Supervisor Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your department's complaint management</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {departments.find((d) => d.id === departmentId)?.name || "All Departments"}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <SupervisorStatsCards
        totalOpen={stats.totalOpen}
        unassigned={stats.unassigned}
        overdue={stats.overdue}
        escalated={stats.escalated}
        loading={loading}
      />

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/supervisor-app/unassigned">
          <Card className="card-hover cursor-pointer h-full">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full p-3 bg-blue-100 dark:bg-blue-900/30">
                <UserPlus className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Unassigned</p>
                <p className="text-2xl font-bold">{stats.unassigned}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/supervisor-app/workload">
          <Card className="card-hover cursor-pointer h-full">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full p-3 bg-green-100 dark:bg-green-900/30">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Team Workload</p>
                <p className="text-xs text-muted-foreground">{staffWorkload.length} staff members</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/supervisor-app/escalations">
          <Card className="card-hover cursor-pointer h-full">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full p-3 bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Escalations</p>
                <p className="text-2xl font-bold">{stats.escalated + stats.overdue}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/supervisor-app/analytics">
          <Card className="card-hover cursor-pointer h-full">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full p-3 bg-purple-100 dark:bg-purple-900/30">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Analytics</p>
                <p className="text-xs text-muted-foreground">View detailed reports</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status Distribution</CardTitle>
            <CardDescription>Current complaint status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">No data available</div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Complaints by Category</CardTitle>
            <CardDescription>Top categories with most complaints</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">No data available</div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical">
                    <XAxis type="number" />
                    <YAxis dataKey="category" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Performers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Top Performers</CardTitle>
              <CardDescription>Staff with most resolved complaints</CardDescription>
            </div>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {topPerformers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No performance data yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topPerformers.map((performer, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted font-medium text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{performer.staff_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {performer.avg_resolution_days !== null
                          ? `Avg. ${performer.avg_resolution_days.toFixed(1)} days`
                          : "No avg. yet"}
                      </p>
                    </div>
                    <Badge variant="secondary">{performer.resolved_count} resolved</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Staff Workload Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Staff Workload</CardTitle>
              <CardDescription>Current assignment distribution</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/supervisor-app/workload">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {staffWorkload.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No staff data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {staffWorkload.slice(0, 5).map((staff) => (
                  <div key={staff.staff_id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate">{staff.staff_name}</span>
                      <span className="text-muted-foreground">{staff.total_assigned} assigned</span>
                    </div>
                    <Progress value={Math.min((staff.total_assigned / 10) * 100, 100)} className="h-2" />
                    {staff.overdue > 0 && <p className="text-xs text-red-500">{staff.overdue} overdue</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
