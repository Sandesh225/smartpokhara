"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TableSkeleton } from "@/components/shared/loading-skeleton"
import { useCurrentUser, useStaffWorkload, useDepartments } from "@/lib/hooks/use-complaints"
import { RefreshCw, Users, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

export default function WorkloadPage() {
  const { user } = useCurrentUser()
  const { departments } = useDepartments()
  const departmentId = user?.department_id || departments[0]?.id || null

  const { workload, loading, refetch } = useStaffWorkload()

  const stats = useMemo(() => {
    const totalStaff = workload.length
    const totalAssigned = workload.reduce((acc, w) => acc + w.total_assigned, 0)
    const totalOverdue = workload.reduce((acc, w) => acc + w.overdue, 0)
    const avgWorkload = totalStaff > 0 ? Math.round(totalAssigned / totalStaff) : 0

    return { totalStaff, totalAssigned, totalOverdue, avgWorkload }
  }, [workload])

  const getWorkloadColor = (assigned: number) => {
    if (assigned >= 10) return "bg-red-500"
    if (assigned >= 7) return "bg-yellow-500"
    if (assigned >= 4) return "bg-blue-500"
    return "bg-green-500"
  }

  const getWorkloadLabel = (assigned: number) => {
    if (assigned >= 10) return { label: "Overloaded", variant: "destructive" as const }
    if (assigned >= 7) return { label: "High", variant: "secondary" as const }
    if (assigned >= 4) return { label: "Medium", variant: "outline" as const }
    return { label: "Low", variant: "outline" as const }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Workload</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage staff assignment distribution</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} className="gap-2 bg-transparent">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-blue-100 dark:bg-blue-900/30">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
              <p className="text-2xl font-bold">{stats.totalStaff}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Assigned</p>
              <p className="text-2xl font-bold">{stats.totalAssigned}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Overdue</p>
              <p className="text-2xl font-bold">{stats.totalOverdue}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-purple-100 dark:bg-purple-900/30">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Workload</p>
              <p className="text-2xl font-bold">{stats.avgWorkload}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workload Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Workload Details</CardTitle>
          <CardDescription>View individual staff assignments and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={5} />
          ) : workload.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium">No staff data available</p>
              <p className="text-sm text-muted-foreground mt-1">Staff workload information will appear here</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead className="w-24">Role</TableHead>
                    <TableHead className="w-32">Workload</TableHead>
                    <TableHead className="w-24 text-center">Total</TableHead>
                    <TableHead className="w-24 text-center">In Progress</TableHead>
                    <TableHead className="w-24 text-center">Pending</TableHead>
                    <TableHead className="w-24 text-center">Overdue</TableHead>
                    <TableHead className="w-28 text-center">This Month</TableHead>
                    <TableHead className="w-28">Avg. Days</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workload.map((staff) => {
                    const workloadInfo = getWorkloadLabel(staff.total_assigned)
                    return (
                      <TableRow key={staff.staff_id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{staff.staff_name}</p>
                            <p className="text-xs text-muted-foreground">{staff.staff_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">
                            {staff.role_type.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <Badge variant={workloadInfo.variant}>{workloadInfo.label}</Badge>
                              <span className="text-muted-foreground">{staff.total_assigned}/10</span>
                            </div>
                            <Progress
                              value={Math.min((staff.total_assigned / 10) * 100, 100)}
                              className={cn(
                                "h-2",
                                staff.total_assigned >= 10 && "[&>div]:bg-red-500",
                                staff.total_assigned >= 7 && staff.total_assigned < 10 && "[&>div]:bg-yellow-500",
                              )}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium">{staff.total_assigned}</TableCell>
                        <TableCell className="text-center">{staff.in_progress}</TableCell>
                        <TableCell className="text-center">{staff.pending_acceptance}</TableCell>
                        <TableCell className="text-center">
                          {staff.overdue > 0 ? (
                            <Badge variant="destructive">{staff.overdue}</Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{staff.completed_this_month}</Badge>
                        </TableCell>
                        <TableCell>
                          {staff.avg_resolution_days !== null ? (
                            <span className="text-sm">{staff.avg_resolution_days.toFixed(1)} days</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
