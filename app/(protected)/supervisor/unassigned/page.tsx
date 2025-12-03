"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PriorityBadge, OverdueBadge } from "@/components/shared/status-badge"
import { QueueFilters } from "@/components/staff/queue-filters"
import { TableSkeleton, TablePagination } from "@/components/shared/loading-skeleton"
import { NoTasksState } from "@/components/shared/empty-state"
import { AssignModal } from "@/components/supervisor/assign-modal"
import { formatRelativeTime } from "@/lib/utils/format"
import {
  useCurrentUser,
  useSupervisorWorkflow,
  useDepartments,
  useComplaintFilters,
  useComplaintSorting,
  useComplaintPagination,
} from "@/lib/hooks/use-complaints"
import type { ComplaintFilters as FiltersType, Complaint } from "@/lib/types/complaints"
import { RefreshCw, UserPlus, Eye } from "lucide-react"

export default function UnassignedPage() {
  const router = useRouter()
  const { user } = useCurrentUser()
  const { departments } = useDepartments()
  const departmentId = user?.department_id || departments[0]?.id || null

  const { unassignedComplaints, availableStaff, handleAssign, loading, refetchUnassigned } =
    useSupervisorWorkflow(departmentId)

  const [filters, setFilters] = useState<FiltersType>({})
  const [sortBy, setSortBy] = useState("submitted_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [assigning, setAssigning] = useState(false)

  // Apply filters and sorting
  const { filteredComplaints } = useComplaintFilters(unassignedComplaints, filters)
  const { sortedComplaints } = useComplaintSorting(
    filteredComplaints,
    sortBy as "submitted_at" | "updated_at" | "sla_due_at" | "priority" | "status",
    sortOrder,
  )
  const {
    paginatedComplaints,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
  } = useComplaintPagination(sortedComplaints, 10)

  const stats = useMemo(() => {
    const total = unassignedComplaints.length
    const overdue = unassignedComplaints.filter((c) => c.is_overdue).length
    const critical = unassignedComplaints.filter((c) => c.priority === "critical").length
    return { total, overdue, critical }
  }, [unassignedComplaints])

  const handleSortChange = useCallback((field: string, order: "asc" | "desc") => {
    setSortBy(field)
    setSortOrder(order)
  }, [])

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
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Unassigned Complaints</h1>
          <p className="text-muted-foreground mt-1">Assign complaints to available staff members</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {stats.critical > 0 && <Badge variant="destructive">{stats.critical} critical</Badge>}
            {stats.overdue > 0 && (
              <Badge variant="outline" className="text-red-600 border-red-300">
                {stats.overdue} overdue
              </Badge>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={refetchUnassigned} className="gap-2 bg-transparent">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      {stats.total > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <UserPlus className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">
                {stats.total} complaint{stats.total !== 1 ? "s" : ""} awaiting assignment
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {availableStaff.length} staff member{availableStaff.length !== 1 ? "s" : ""} available
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Complaints Queue</CardTitle>
          <CardDescription>Click on a complaint to view details or use the assign button</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <QueueFilters
            filters={filters}
            onFiltersChange={setFilters}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
          />

          {/* Table */}
          {loading ? (
            <TableSkeleton rows={5} />
          ) : paginatedComplaints.length === 0 ? (
            <NoTasksState
              title="No unassigned complaints"
              description="All complaints have been assigned. Great job!"
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28">Tracking #</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="w-24">Ward</TableHead>
                    <TableHead className="w-32">Category</TableHead>
                    <TableHead className="w-24">Priority</TableHead>
                    <TableHead className="w-28">SLA</TableHead>
                    <TableHead className="w-32">Submitted</TableHead>
                    <TableHead className="w-32"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedComplaints.map((complaint) => (
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
                      <TableCell>{complaint.ward_number ? `Ward ${complaint.ward_number}` : "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{complaint.category_name}</TableCell>
                      <TableCell>
                        <PriorityBadge priority={complaint.priority} />
                      </TableCell>
                      <TableCell>
                        <OverdueBadge isOverdue={complaint.is_overdue} slaDueAt={complaint.sla_due_at} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatRelativeTime(complaint.submitted_at)}
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
                            Assign
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
              onNextPage={nextPage}
              onPreviousPage={previousPage}
            />
          )}
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
