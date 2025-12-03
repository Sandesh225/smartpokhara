"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ComplaintTable } from "@/components/staff/complaint-table"
import { QueueFilters } from "@/components/staff/queue-filters"
import { NewComplaintsBanner } from "@/components/shared/new-complaints-banner"
import { AcceptModal, RejectModal, UpdateProgressModal, ResolveModal } from "@/components/staff/action-modals"
import { TablePagination } from "@/components/shared/loading-skeleton"
import {
  useStaffWorkflowManager,
  useQueueRealtimeUpdates,
  useComplaintFilters,
  useComplaintSorting,
  useComplaintPagination,
} from "@/lib/hooks/use-complaints"
import type { QueueType, Complaint, ComplaintFilters as FiltersType } from "@/lib/types/complaints"
import { RefreshCw } from "lucide-react"

interface QueuePageLayoutProps {
  queueType: QueueType
  title: string
  description: string
  showAssignment?: boolean
}

export function QueuePageLayout({ queueType, title, description, showAssignment = false }: QueuePageLayoutProps) {
  // State for modals
  const [acceptModalOpen, setAcceptModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [progressModalOpen, setProgressModalOpen] = useState(false)
  const [resolveModalOpen, setResolveModalOpen] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)

  // State for filters and sorting
  const [filters, setFilters] = useState<FiltersType>({})
  const [sortBy, setSortBy] = useState("submitted_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Hooks
  const { complaints, loading, handleAccept, handleReject, handleUpdateProgress, handleResolve, refetchQueue, user } =
    useStaffWorkflowManager(queueType)

  const { hasNewComplaints, clearNewComplaintsFlag } = useQueueRealtimeUpdates(queueType, user?.user_id || null)

  // Apply filters and sorting
  const { filteredComplaints } = useComplaintFilters(complaints, filters)
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

  // Stats
  const stats = useMemo(() => {
    const total = complaints.length
    const overdue = complaints.filter((c) => c.is_overdue).length
    const pending = complaints.filter((c) => c.status === "assigned").length
    return { total, overdue, pending }
  }, [complaints])

  // Handlers
  const handleSortChange = useCallback((field: string, order: "asc" | "desc") => {
    setSortBy(field)
    setSortOrder(order)
  }, [])

  const handleRefresh = useCallback(() => {
    refetchQueue()
    clearNewComplaintsFlag()
  }, [refetchQueue, clearNewComplaintsFlag])

  const openAcceptModal = useCallback(
    (id: string) => {
      const complaint = complaints.find((c) => c.id === id)
      setSelectedComplaint(complaint || null)
      setAcceptModalOpen(true)
    },
    [complaints],
  )

  const openRejectModal = useCallback(
    (id: string) => {
      const complaint = complaints.find((c) => c.id === id)
      setSelectedComplaint(complaint || null)
      setRejectModalOpen(true)
    },
    [complaints],
  )

  const openProgressModal = useCallback(
    (id: string) => {
      const complaint = complaints.find((c) => c.id === id)
      setSelectedComplaint(complaint || null)
      setProgressModalOpen(true)
    },
    [complaints],
  )

  const openResolveModal = useCallback(
    (id: string) => {
      const complaint = complaints.find((c) => c.id === id)
      setSelectedComplaint(complaint || null)
      setResolveModalOpen(true)
    },
    [complaints],
  )

  const handleAcceptConfirm = async (notes?: string) => {
    if (!selectedComplaint) return
    await handleAccept(selectedComplaint.id, notes)
    setAcceptModalOpen(false)
    setSelectedComplaint(null)
  }

  const handleRejectConfirm = async (reason: string) => {
    if (!selectedComplaint) return
    await handleReject(selectedComplaint.id, reason)
    setRejectModalOpen(false)
    setSelectedComplaint(null)
  }

  const handleProgressConfirm = async (note: string) => {
    if (!selectedComplaint) return
    await handleUpdateProgress(selectedComplaint.id, note)
    setProgressModalOpen(false)
    setSelectedComplaint(null)
  }

  const handleResolveConfirm = async (resolutionNotes: string) => {
    if (!selectedComplaint) return
    await handleResolve(selectedComplaint.id, resolutionNotes)
    setResolveModalOpen(false)
    setSelectedComplaint(null)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {stats.pending > 0 && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20">
                {stats.pending} pending
              </Badge>
            )}
            {stats.overdue > 0 && <Badge variant="destructive">{stats.overdue} overdue</Badge>}
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2 bg-transparent">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* New Complaints Banner */}
      {hasNewComplaints && <NewComplaintsBanner onRefresh={handleRefresh} onDismiss={clearNewComplaintsFlag} />}

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Complaints</CardTitle>
              <CardDescription>
                {stats.total} total complaint{stats.total !== 1 ? "s" : ""} in queue
              </CardDescription>
            </div>
          </div>
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
          <ComplaintTable
            complaints={paginatedComplaints}
            loading={loading}
            onAccept={openAcceptModal}
            onReject={openRejectModal}
            onUpdateProgress={openProgressModal}
            onResolve={openResolveModal}
            currentUserId={user?.user_id}
            showAssignment={showAssignment}
            baseUrl="/staff-app/complaints"
          />

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

      {/* Modals */}
      <AcceptModal
        open={acceptModalOpen}
        onOpenChange={setAcceptModalOpen}
        onConfirm={handleAcceptConfirm}
        loading={loading}
        trackingCode={selectedComplaint?.tracking_code}
      />

      <RejectModal
        open={rejectModalOpen}
        onOpenChange={setRejectModalOpen}
        onConfirm={handleRejectConfirm}
        loading={loading}
        trackingCode={selectedComplaint?.tracking_code}
      />

      <UpdateProgressModal
        open={progressModalOpen}
        onOpenChange={setProgressModalOpen}
        onConfirm={handleProgressConfirm}
        loading={loading}
        trackingCode={selectedComplaint?.tracking_code}
      />

      <ResolveModal
        open={resolveModalOpen}
        onOpenChange={setResolveModalOpen}
        onConfirm={handleResolveConfirm}
        loading={loading}
        trackingCode={selectedComplaint?.tracking_code}
      />
    </div>
  )
}
