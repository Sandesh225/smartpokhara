"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Users, TrendingUp, CheckCircle2, AlertTriangle, RefreshCw, Activity } from "lucide-react"
import { useStaffWorkload, useDepartments } from "@/lib/hooks/use-complaints"
import { EmptyState } from "@/components/shared/empty-state"
import type { StaffWorkload } from "@/lib/types/complaints"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function getWorkloadStatus(activeCount: number) {
  if (activeCount >= 10) return { label: "At Capacity", color: "text-red-600 bg-red-50" }
  if (activeCount >= 7) return { label: "High Load", color: "text-orange-600 bg-orange-50" }
  if (activeCount >= 4) return { label: "Moderate", color: "text-yellow-600 bg-yellow-50" }
  return { label: "Available", color: "text-green-600 bg-green-50" }
}

function StaffCard({ staff }: { staff: StaffWorkload }) {
  const workloadStatus = getWorkloadStatus(staff.active_count)
  const completionRate =
    staff.total_resolved > 0
      ? Math.round((staff.total_resolved / (staff.total_resolved + staff.active_count)) * 100)
      : 0

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={staff.avatar_url || undefined} />
            <AvatarFallback>{getInitials(staff.full_name || "Staff")}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold truncate">{staff.full_name}</h3>
              <Badge variant="outline" className={workloadStatus.color}>
                {workloadStatus.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">{staff.email}</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Active Tasks</span>
                <span className="font-medium">{staff.active_count}/10</span>
              </div>
              <Progress value={staff.active_count * 10} className="h-2" />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-muted/50 p-2">
                <div className="text-lg font-bold text-blue-600">{staff.active_count}</div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <div className="text-lg font-bold text-green-600">{staff.total_resolved}</div>
                <div className="text-xs text-muted-foreground">Resolved</div>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <div className="text-lg font-bold text-purple-600">{completionRate}%</div>
                <div className="text-xs text-muted-foreground">Rate</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function StaffPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

  const { workloads, loading, error, refetch } = useStaffWorkload()
  const { departments } = useDepartments()

  const filteredStaff = useMemo(() => {
    return workloads.filter((staff) => {
      const matchesSearch =
        searchQuery === "" ||
        staff.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.email?.toLowerCase().includes(searchQuery.toLowerCase())

      let matchesStatus = true
      if (statusFilter === "available") matchesStatus = staff.active_count < 7
      else if (statusFilter === "busy") matchesStatus = staff.active_count >= 7 && staff.active_count < 10
      else if (statusFilter === "full") matchesStatus = staff.active_count >= 10

      const matchesDepartment = departmentFilter === "all" || staff.department_id === departmentFilter

      return matchesSearch && matchesStatus && matchesDepartment
    })
  }, [workloads, searchQuery, statusFilter, departmentFilter])

  const stats = useMemo(() => {
    const total = workloads.length
    const available = workloads.filter((w) => w.active_count < 7).length
    const busy = workloads.filter((w) => w.active_count >= 7 && w.active_count < 10).length
    const full = workloads.filter((w) => w.active_count >= 10).length
    const totalActive = workloads.reduce((sum, w) => sum + w.active_count, 0)
    const totalResolved = workloads.reduce((sum, w) => sum + w.total_resolved, 0)
    return { total, available, busy, full, totalActive, totalResolved }
  }, [workloads])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">Monitor staff workloads and performance</p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Busy</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.busy}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">At Capacity</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.full}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Resolved</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalResolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="full">At Capacity</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "table")}>
              <TabsList>
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="table">Table</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 rounded bg-muted" />
                      <div className="h-3 w-1/2 rounded bg-muted" />
                    </div>
                  </div>
                  <div className="h-2 rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={AlertTriangle}
          title="Error loading staff"
          description={error.message}
          action={{ label: "Retry", onClick: refetch }}
        />
      ) : filteredStaff.length === 0 ? (
        <EmptyState icon={Users} title="No staff found" description="No staff members match your search criteria" />
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStaff.map((staff) => (
            <StaffCard key={staff.user_id} staff={staff} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Active Tasks</TableHead>
                    <TableHead>Resolved</TableHead>
                    <TableHead>Completion Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((staff) => {
                    const workloadStatus = getWorkloadStatus(staff.active_count)
                    const completionRate =
                      staff.total_resolved > 0
                        ? Math.round((staff.total_resolved / (staff.total_resolved + staff.active_count)) * 100)
                        : 0
                    return (
                      <TableRow key={staff.user_id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={staff.avatar_url || undefined} />
                              <AvatarFallback>{getInitials(staff.full_name || "Staff")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{staff.full_name}</div>
                              <div className="text-xs text-muted-foreground">{staff.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={workloadStatus.color}>
                            {workloadStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={staff.active_count * 10} className="h-2 w-20" />
                            <span className="text-sm">{staff.active_count}/10</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{staff.total_resolved}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{completionRate}%</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
