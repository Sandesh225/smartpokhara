"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from '@/lib/shared/toast-service';

import type {

  Complaint,
  ComplaintDetail,
  ComplaintStatus,
  Priority,
  QueueType,
  UserWithRoles,
  Category,
  Ward,
  Department,
  StaffNotification,
  StaffWorkload,
  Analytics,
  ComplaintFilters,
} from "@/lib/types/complaints"

// ============================================================================
// UTILITY HOOKS
// ============================================================================

export function useSupabase() {
  const supabase = useMemo(() => createClient(), [])
  return supabase
}

export function useCurrentUser() {
  const supabase = useSupabase()
  const [user, setUser] = useState<UserWithRoles | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadUser = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.rpc("get_current_user_with_roles")
      if (error) throw error
      setUser(data?.[0] || null)
      setError(null)
    } catch (err) {
      setError(err as Error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadUser()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser()
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, loadUser])

  return { user, loading, error, refetch: loadUser }
}

// ============================================================================
// STAFF QUEUE HOOKS
// ============================================================================

export function useStaffQueue(
  queueType: QueueType = "my_tasks",
  status?: ComplaintStatus,
  priority?: Priority,
  limit = 50,
  offset = 0,
) {
  const supabase = useSupabase()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchQueue = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.rpc("rpc_get_staff_queue", {
        p_queue_type: queueType,
        p_status: status || null,
        p_priority: priority || null,
        p_limit: limit,
        p_offset: offset,
      })
      if (error) throw error
      setComplaints(data || [])
    } catch (err) {
      setError(err as Error)
      setComplaints([])
    } finally {
      setLoading(false)
    }
  }, [supabase, queueType, status, priority, limit, offset])

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  return { complaints, loading, error, refetch: fetchQueue }
}

export function useAcceptComplaint() {
  const supabase = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const acceptComplaint = useCallback(
    async (complaintId: string, userId: string, notes?: string) => {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await supabase.rpc("staff_accept_complaint", {
          p_complaint_id: complaintId,
          p_staff_user_id: userId,
          p_notes: notes || null,
        })
        if (error) throw error
        toast({
          title: "Success",
          description: "Complaint accepted and moved to in progress",
        })
        return data
      } catch (err) {
        const error = err as Error
        setError(error)
        toast({
          title: "Error",
          description: error.message || "Failed to accept complaint",
          variant: "destructive",
        })
        throw error
      } finally {
        setLoading(false)
      }
    },
    [supabase, toast],
  )

  return { acceptComplaint, loading, error }
}

export function useRejectComplaint() {
  const supabase = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const rejectComplaint = useCallback(
    async (complaintId: string, userId: string, reason: string) => {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await supabase.rpc("staff_reject_complaint", {
          p_complaint_id: complaintId,
          p_staff_user_id: userId,
          p_reason: reason,
        })
        if (error) throw error
        toast({
          title: "Complaint rejected",
          description: "Assignment returned to pool",
        })
        return data
      } catch (err) {
        const error = err as Error
        setError(error)
        toast({
          title: "Error",
          description: error.message || "Failed to reject complaint",
          variant: "destructive",
        })
        throw error
      } finally {
        setLoading(false)
      }
    },
    [supabase, toast],
  )

  return { rejectComplaint, loading, error }
}

export function useUpdateProgress() {
  const supabase = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateProgress = useCallback(
    async (complaintId: string, userId: string, note: string, attachments?: unknown) => {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await supabase.rpc("update_complaint_progress", {
          p_complaint_id: complaintId,
          p_staff_user_id: userId,
          p_progress_note: note,
          p_attachments: attachments || null,
        })
        if (error) throw error
        toast({
          title: "Progress updated",
          description: "Work log added successfully",
        })
        return data
      } catch (err) {
        const error = err as Error
        setError(error)
        toast({
          title: "Error",
          description: error.message || "Failed to update progress",
          variant: "destructive",
        })
        throw error
      } finally {
        setLoading(false)
      }
    },
    [supabase, toast],
  )

  return { updateProgress, loading, error }
}

export function useResolveComplaint() {
  const supabase = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const resolveComplaint = useCallback(
    async (complaintId: string, resolutionNotes: string, attachments?: unknown) => {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await supabase.rpc("rpc_resolve_complaint", {
          p_complaint_id: complaintId,
          p_resolution_notes: resolutionNotes,
          p_attachments: attachments || null,
        })
        if (error) throw error
        toast({
          title: "Success!",
          description: "Complaint marked as resolved",
        })
        return data
      } catch (err) {
        const error = err as Error
        setError(error)
        toast({
          title: "Error",
          description: error.message || "Failed to resolve complaint",
          variant: "destructive",
        })
        throw error
      } finally {
        setLoading(false)
      }
    },
    [supabase, toast],
  )

  return { resolveComplaint, loading, error }
}

// ============================================================================
// COMPLAINT DETAIL HOOK
// ============================================================================

export function useComplaintDetail(complaintId: string | null) {
  const supabase = useSupabase()
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchComplaint = useCallback(async () => {
    if (!complaintId) {
      setLoading(false)
      setComplaint(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.rpc("rpc_get_complaint_detail", {
        p_complaint_id: complaintId,
      })
      if (error) throw error
      setComplaint(data)
    } catch (err) {
      setError(err as Error)
      setComplaint(null)
    } finally {
      setLoading(false)
    }
  }, [supabase, complaintId])

  useEffect(() => {
    fetchComplaint()
  }, [fetchComplaint])

  return { complaint, loading, error, refetch: fetchComplaint }
}

// ============================================================================
// SUPERVISOR/ADMIN HOOKS
// ============================================================================

export function useAssignComplaint() {
  const supabase = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const assignComplaint = useCallback(
    async (complaintId: string, staffUserId: string, note?: string) => {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await supabase.rpc("rpc_assign_complaint", {
          p_complaint_id: complaintId,
          p_staff_user_id: staffUserId,
          p_note: note || null,
        })
        if (error) throw error
        toast({
          title: "Assigned",
          description: "Complaint assigned to staff member",
        })
        return data
      } catch (err) {
        const error = err as Error
        setError(error)
        toast({
          title: "Error",
          description: error.message || "Failed to assign complaint",
          variant: "destructive",
        })
        throw error
      } finally {
        setLoading(false)
      }
    },
    [supabase, toast],
  )

  return { assignComplaint, loading, error }
}

export function useUnassignedComplaints(departmentId: string | null) {
  const supabase = useSupabase()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchUnassigned = useCallback(async () => {
    if (!departmentId) {
      setLoading(false)
      setComplaints([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.rpc("get_unassigned_complaints_for_department", {
        p_department_id: departmentId,
      })
      if (error) throw error
      setComplaints(data || [])
    } catch (err) {
      setError(err as Error)
      setComplaints([])
    } finally {
      setLoading(false)
    }
  }, [supabase, departmentId])

  useEffect(() => {
    fetchUnassigned()
  }, [fetchUnassigned])

  return { complaints, loading, error, refetch: fetchUnassigned }
}

export function useStaffWorkload(staffUserId?: string) {
  const supabase = useSupabase()
  const [workload, setWorkload] = useState<StaffWorkload[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchWorkload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.rpc("get_staff_workload", {
        p_staff_user_id: staffUserId || null,
      })
      if (error) throw error
      setWorkload(data || [])
    } catch (err) {
      setError(err as Error)
      setWorkload([])
    } finally {
      setLoading(false)
    }
  }, [supabase, staffUserId])

  useEffect(() => {
    fetchWorkload()
  }, [fetchWorkload])

  return { workload, loading, error, refetch: fetchWorkload }
}

// ============================================================================
// ANALYTICS HOOKS
// ============================================================================

export function useComplaintAnalytics(startDate?: string, endDate?: string, wardId?: string, departmentId?: string) {
  const supabase = useSupabase()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.rpc("rpc_get_complaint_analytics", {
        p_start_date: startDate || null,
        p_end_date: endDate || null,
        p_ward_id: wardId || null,
        p_department_id: departmentId || null,
      })
      if (error) throw error
      setAnalytics(data)
    } catch (err) {
      setError(err as Error)
      setAnalytics(null)
    } finally {
      setLoading(false)
    }
  }, [supabase, startDate, endDate, wardId, departmentId])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return { analytics, loading, error, refetch: fetchAnalytics }
}

// ============================================================================
// REFERENCE DATA HOOKS
// ============================================================================

export function useCategories() {
  const supabase = useSupabase()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from("complaint_categories")
          .select(
            `
            id,
            name,
            name_nepali,
            icon,
            color,
            complaint_subcategories (
              id,
              name,
              name_nepali,
              default_priority,
              sla_days
            )
          `,
          )
          .eq("is_active", true)
          .order("display_order")
        if (error) throw error
        setCategories(data || [])
      } catch (err) {
        setError(err as Error)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [supabase])

  return { categories, loading, error }
}

export function useWards() {
  const supabase = useSupabase()
  const [wards, setWards] = useState<Ward[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchWards() {
      try {
        const { data, error } = await supabase
          .from("wards")
          .select("id, ward_number, name, name_nepali")
          .eq("is_active", true)
          .order("ward_number")
        if (error) throw error
        setWards(data || [])
      } catch (err) {
        setError(err as Error)
        setWards([])
      } finally {
        setLoading(false)
      }
    }
    fetchWards()
  }, [supabase])

  return { wards, loading, error }
}

export function useDepartments() {
  const supabase = useSupabase()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const { data, error } = await supabase
          .from("departments")
          .select("id, name, name_nepali, code")
          .eq("is_active", true)
          .order("name")
        if (error) throw error
        setDepartments(data || [])
      } catch (err) {
        setError(err as Error)
        setDepartments([])
      } finally {
        setLoading(false)
      }
    }
    fetchDepartments()
  }, [supabase])

  return { departments, loading, error }
}

// ============================================================================
// NOTIFICATIONS HOOKS
// ============================================================================

export function useStaffNotifications() {
  const supabase = useSupabase()
  const [notifications, setNotifications] = useState<StaffNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from("staff_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)
      if (error) throw error
      setNotifications(data || [])
      setUnreadCount(data?.filter((n) => !n.is_read).length || 0)
    } catch (err) {
      setError(err as Error)
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        const { error } = await supabase
          .from("staff_notifications")
          .update({
            is_read: true,
            read_at: new Date().toISOString(),
          })
          .eq("id", notificationId)
        if (error) throw error
        await fetchNotifications()
      } catch (err) {
        console.error("Error marking notification as read:", err)
      }
    },
    [supabase, fetchNotifications],
  )

  const markAllAsRead = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const { error } = await supabase
        .from("staff_notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("is_read", false)
      if (error) throw error
      await fetchNotifications()
    } catch (err) {
      console.error("Error marking all as read:", err)
    }
  }, [supabase, fetchNotifications])

  useEffect(() => {
    fetchNotifications()
    const channel = supabase
      .channel("staff-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "staff_notifications",
        },
        (payload) => {
          setNotifications((prev) => [payload.new as StaffNotification, ...prev])
          setUnreadCount((prev) => prev + 1)
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
  }
}

// ============================================================================
// REAL-TIME HOOKS
// ============================================================================

export function useComplaintRealtimeUpdates(complaintId: string | null) {
  const supabase = useSupabase()
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const { refetch } = useComplaintDetail(complaintId)

  useEffect(() => {
    if (!complaintId) return
    const channel = supabase
      .channel(`complaint-${complaintId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "complaints",
          filter: `id=eq.${complaintId}`,
        },
        () => {
          setLastUpdate(new Date())
          refetch()
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "complaint_status_history",
          filter: `complaint_id=eq.${complaintId}`,
        },
        () => {
          setLastUpdate(new Date())
          refetch()
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, complaintId, refetch])

  return { lastUpdate }
}

export function useQueueRealtimeUpdates(queueType: QueueType, userId: string | null) {
  const supabase = useSupabase()
  const [hasNewComplaints, setHasNewComplaints] = useState(false)
  const { refetch } = useStaffQueue(queueType)

  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`queue-${queueType}-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "complaints",
        },
        () => {
          setHasNewComplaints(true)
          refetch()
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "complaints",
          filter: queueType === "my_tasks" ? `assigned_staff_id=eq.${userId}` : undefined,
        },
        () => {
          refetch()
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, queueType, userId, refetch])

  const clearNewComplaintsFlag = useCallback(() => {
    setHasNewComplaints(false)
  }, [])

  return { hasNewComplaints, clearNewComplaintsFlag }
}

// ============================================================================
// FILTERING & SORTING HOOKS
// ============================================================================

export function useComplaintFilters(complaints: Complaint[], filters: ComplaintFilters) {
  const filteredComplaints = useMemo(() => {
    let result = [...complaints]
    if (filters.status && filters.status.length > 0) {
      result = result.filter((c) => filters.status!.includes(c.status))
    }
    if (filters.priority && filters.priority.length > 0) {
      result = result.filter((c) => filters.priority!.includes(c.priority))
    }
    if (filters.ward && filters.ward.length > 0) {
      result = result.filter((c) => c.ward_number && filters.ward!.includes(c.ward_number))
    }
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      result = result.filter(
        (c) =>
          c.tracking_code.toLowerCase().includes(term) ||
          c.title.toLowerCase().includes(term) ||
          c.description.toLowerCase().includes(term),
      )
    }
    if (filters.dateFrom) {
      result = result.filter((c) => new Date(c.submitted_at) >= new Date(filters.dateFrom!))
    }
    if (filters.dateTo) {
      result = result.filter((c) => new Date(c.submitted_at) <= new Date(filters.dateTo!))
    }
    return result
  }, [complaints, filters])

  return { filteredComplaints }
}

export function useComplaintSorting(
  complaints: Complaint[],
  sortBy: "submitted_at" | "updated_at" | "sla_due_at" | "priority" | "status" = "submitted_at",
  sortOrder: "asc" | "desc" = "desc",
) {
  const sortedComplaints = useMemo(() => {
    const result = [...complaints]
    result.sort((a, b) => {
      let compareValue = 0
      switch (sortBy) {
        case "submitted_at":
        case "updated_at":
        case "sla_due_at":
          const dateA = new Date(a[sortBy] || 0).getTime()
          const dateB = new Date(b[sortBy] || 0).getTime()
          compareValue = dateA - dateB
          break
        case "priority":
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          compareValue = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
        case "status":
          compareValue = a.status.localeCompare(b.status)
          break
      }
      return sortOrder === "asc" ? compareValue : -compareValue
    })
    return result
  }, [complaints, sortBy, sortOrder])

  return { sortedComplaints }
}

export function useComplaintPagination(complaints: Complaint[], pageSize = 20) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(complaints.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize

  const paginatedComplaints = useMemo(() => {
    return complaints.slice(startIndex, endIndex)
  }, [complaints, startIndex, endIndex])

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page)
      }
    },
    [totalPages],
  )

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1)
  }, [currentPage, goToPage])

  const previousPage = useCallback(() => {
    goToPage(currentPage - 1)
  }, [currentPage, goToPage])

  return {
    paginatedComplaints,
    currentPage,
    totalPages,
    pageSize,
    goToPage,
    nextPage,
    previousPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  }
}

// ============================================================================
// COMBINED WORKFLOW HOOKS
// ============================================================================

export function useStaffWorkflowManager(queueType: QueueType = "my_tasks") {
  const { complaints, loading: queueLoading, refetch: refetchQueue } = useStaffQueue(queueType)
  const { acceptComplaint, loading: accepting } = useAcceptComplaint()
  const { rejectComplaint, loading: rejecting } = useRejectComplaint()
  const { updateProgress, loading: updating } = useUpdateProgress()
  const { resolveComplaint, loading: resolving } = useResolveComplaint()
  const { user } = useCurrentUser()

  const handleAccept = useCallback(
    async (complaintId: string, notes?: string) => {
      if (!user) throw new Error("User not authenticated")
      await acceptComplaint(complaintId, user.user_id, notes)
      await refetchQueue()
    },
    [acceptComplaint, user, refetchQueue],
  )

  const handleReject = useCallback(
    async (complaintId: string, reason: string) => {
      if (!user) throw new Error("User not authenticated")
      await rejectComplaint(complaintId, user.user_id, reason)
      await refetchQueue()
    },
    [rejectComplaint, user, refetchQueue],
  )

  const handleUpdateProgress = useCallback(
    async (complaintId: string, note: string, attachments?: unknown) => {
      if (!user) throw new Error("User not authenticated")
      await updateProgress(complaintId, user.user_id, note, attachments)
    },
    [updateProgress, user],
  )

  const handleResolve = useCallback(
    async (complaintId: string, resolutionNotes: string, attachments?: unknown) => {
      await resolveComplaint(complaintId, resolutionNotes, attachments)
      await refetchQueue()
    },
    [resolveComplaint, refetchQueue],
  )

  return {
    complaints,
    loading: queueLoading || accepting || rejecting || updating || resolving,
    handleAccept,
    handleReject,
    handleUpdateProgress,
    handleResolve,
    refetchQueue,
    user,
  }
}

export function useSupervisorWorkflow(departmentId: string | null) {
  const {
    complaints: unassigned,
    loading: unassignedLoading,
    refetch: refetchUnassigned,
  } = useUnassignedComplaints(departmentId)
  const { assignComplaint, loading: assigning } = useAssignComplaint()
  const { workload, loading: workloadLoading, refetch: refetchWorkload } = useStaffWorkload()

  const handleAssign = useCallback(
    async (complaintId: string, staffUserId: string, note?: string) => {
      await assignComplaint(complaintId, staffUserId, note)
      await Promise.all([refetchUnassigned(), refetchWorkload()])
    },
    [assignComplaint, refetchUnassigned, refetchWorkload],
  )

  const getAvailableStaff = useCallback(() => {
    return workload.filter((w) => w.total_assigned < 10).sort((a, b) => a.total_assigned - b.total_assigned)
  }, [workload])

  return {
    unassignedComplaints: unassigned,
    staffWorkload: workload,
    availableStaff: getAvailableStaff(),
    loading: unassignedLoading || assigning || workloadLoading,
    handleAssign,
    refetchUnassigned,
    refetchWorkload,
  }
}

export function useAdminDashboard(startDate?: string, endDate?: string, wardId?: string, departmentId?: string) {
  const {
    analytics,
    loading: analyticsLoading,
    refetch: refetchAnalytics,
  } = useComplaintAnalytics(startDate, endDate, wardId, departmentId)
  const { workload, loading: workloadLoading, refetch: refetchWorkload } = useStaffWorkload()
  const { categories } = useCategories()
  const { wards } = useWards()
  const { departments } = useDepartments()

  const getOverdueComplaints = useCallback(() => {
    return analytics?.summary.overdue || 0
  }, [analytics])

  const getTopPerformers = useCallback(() => {
    return analytics?.top_performers || []
  }, [analytics])

  const getCategoryInsights = useCallback(() => {
    return analytics?.by_category || []
  }, [analytics])

  const getWardInsights = useCallback(() => {
    return analytics?.by_ward || []
  }, [analytics])

  const refreshAllData = useCallback(async () => {
    await Promise.all([refetchAnalytics(), refetchWorkload()])
  }, [refetchAnalytics, refetchWorkload])

  return {
    analytics,
    staffWorkload: workload,
    categories,
    wards,
    departments,
    loading: analyticsLoading || workloadLoading,
    getOverdueComplaints,
    getTopPerformers,
    getCategoryInsights,
    getWardInsights,
    refreshAllData,
  }
}
