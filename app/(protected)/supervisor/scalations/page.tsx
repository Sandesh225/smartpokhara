"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge"
import { TableSkeleton } from "@/components/shared/loading-skeleton"
import { NoTasksState } from "@/components/shared/empty-state"
import { AssignModal } from "@/components/supervisor/assign-modal"
import { formatRelativeTime } from "@/lib/utils/format"
import { useCurrentUser, useStaffQueue, useSupervisorWorkflow, useDepartments } from "@/lib/hooks/use-complaints"
import type { Complaint } from "@/lib/types/complaints"
import { RefreshCw, AlertTriangle, Clock, Eye, UserPlus } from "lucide-react"

export default function EscalationsPage() {
  const router = useRouter()
  const { user } = useCurrentUser()
  const { departments } = useDepartments()
  const departmentId = user?.department_id || departments[0]?.id || null

  const { complaints: allComplaints, loading, refetch } = useStaffQueue("team_queue")
  const { availableStaff, handleAssign } = useSupervisorWorkflow(departmentId)

  const [activeTab, setActiveTab] = useState("all")
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [assigning, setAssigning] = useState(false)

  // Filter escalated and overdue complaints
  const escalatedComplaints = useMemo(() => {
    return allComplaints.filter((c) => c.status === "escalated" || c.is_overdue)
  }, [allComplaints])

  const overdueOnly = useMemo(() => {
    return allComplaints.filter((c) => c.is_overdue && c.status !== "escalated")
  }, [allComplaints])

  const escalatedOnly = useMemo(() => {
    return allComplaints.filter((c) => c.status === "escalated")
  }, [allComplaints])

  const getDisplayedComplaints = () => {
    switch (activeTab) {
      case "overdue":
        return overdueOnly
      case "escalated":
        return escalatedOnly
      default:
        return escalatedComplaints
    }
  }

  const displayedComplaints = getDisplayedComplaints()

  const openAssignModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint)
    setAssignModalOpen(true)
  }

  const handleAssignConfirm = async (staffId: string, note?: string) => {
    if (!selectedComplaint) return
    setAssigning(true)
    try {
      await handleAssign(selectedComplaint.id, staffId, note)
      setAssignModalOpen(false)
      setSelectedComplaint(null)
      refetch()
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Escalations & SLA Breaches</h1>
          <p className="text-muted-foreground mt-1">Monitor and address complaints requiring urgent attention</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} className="gap-2 bg-transparent">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Banner */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-red-100 dark:bg-red-900/50">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">Total Issues</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">{escalatedComplaints.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-orange-100 dark:bg-orange-900/50">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-orange-800 dark:text-orange-300">Overdue</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{overdueOnly.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-purple-100 dark:bg-purple-900/50">
              <AlertTriangle className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Escalated</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{escalatedOnly.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Complaints Requiring Attention</CardTitle>
          <CardDescription>Review and reassign complaints that have breached SLA or been escalated</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all" className="gap-2">
                All Issues
                <Badge variant="secondary">{escalatedComplaints.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="overdue" className="gap-2">
                Overdue
                <Badge variant="secondary">{overdueOnly.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="escalated" className="gap-2">
                Escalated
                <Badge variant="secondary">{escalatedOnly.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {loading ? (
                <TableSkeleton rows={5} />
              ) : displayedComplaints.length === 0 ? (
                <NoTasksState title="No escalations" description="All complaints are on track. Great job!" />
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-28">Tracking #</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead className="w-28">Status</TableHead>
                        <TableHead className="w-24">Priority</TableHead>
                        <TableHead className="w-32">Assigned To</TableHead>
                        <TableHead className="w-28">SLA Due</TableHead>
                        <TableHead className="w-28">Issue</TableHead>
                        <TableHead className="w-32"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayedComplaints.map((complaint) => (
                        <TableRow key={complaint.id} className="group">
                          <TableCell className="font-mono text-sm">{complaint.tracking_code}</TableCell>
                          <TableCell>
                            <Link
                              href={`/supervisor-app/complaints/${complaint.id}`}
                              className="font-medium hover:underline"
                            >
                              {complaint.title}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={complaint.status} />
                          </TableCell>
                          <TableCell>
                            <PriorityBadge priority={complaint.priority} />
                          </TableCell>
                          <TableCell className="text-sm">
                            {complaint.assigned_staff_name || <span className="text-muted-foreground">Unassigned</span>}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {complaint.sla_due_at ? formatRelativeTime(complaint.sla_due_at) : "-"}
                          </TableCell>
                          <TableCell>
                            {complaint.is_overdue && (
                              <Badge variant="destructive" className="text-xs">
                                Overdue
                              </Badge>
                            )}
                            {complaint.status === "escalated" && (
                              <Badge variant="outline" className="text-xs text-purple-600 border-purple-300">
                                Escalated
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/supervisor-app/complaints/${complaint.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" onClick={() => openAssignModal(complaint)}>
                                <UserPlus className="h-4 w-4 mr-1" />
                                Reassign
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Assign Modal */}
      <AssignModal
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        onConfirm={handleAssignConfirm}
        loading={assigning}
        trackingCode={selectedComplaint?.tracking_code}
        availableStaff={availableStaff}
      />
    </div>
  )
}
