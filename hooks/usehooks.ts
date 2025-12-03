// ============================================================================
// SMART CITY POKHARA - COMPLETE COMPLAINT WORKFLOWS HOOKS LIBRARY
// File: app/(lib)/hooks/useComplaints.ts
// All complaint workloads & workflows implemented as React hooks
// ============================================================================

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/components/ui/use-toast'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Enums as union types
export type ComplaintStatus = 
  | 'draft'
  | 'submitted'
  | 'received'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'rejected'
  | 'escalated'

export type Priority = 'low' | 'medium' | 'high' | 'critical'

export type ComplaintSource = 
  | 'web'
  | 'mobile_app'
  | 'call_center'
  | 'staff_entered'
  | 'email'
  | 'walk_in'

export type QueueType = 'my_tasks' | 'team_queue' | 'ward_queue'

export type UserRole =
  | 'admin'
  | 'dept_head'
  | 'dept_staff'
  | 'ward_staff'
  | 'field_staff'
  | 'call_center'
  | 'citizen'
  | 'business_owner'
  | 'tourist'

// Core Interfaces
export interface Complaint {
  id: string
  tracking_code: string
  title: string
  description: string
  status: ComplaintStatus
  priority: Priority
  category_name: string
  subcategory_name: string | null
  ward_number: number | null
  citizen_name?: string
  assigned_staff_name?: string
  submitted_at: string
  updated_at: string
  sla_due_at: string | null
  is_overdue: boolean
  has_feedback: boolean
  latest_status_note?: string
}

export interface StatusHistoryEntry {
  old_status: ComplaintStatus | null
  new_status: ComplaintStatus
  changed_by: string
  note: string
  changed_at: string
}

export interface Attachment {
  file_name: string
  file_url: string
  uploaded_at: string
}

export interface InternalComment {
  comment: string
  user_name: string
  is_work_log: boolean
  created_at: string
}

export interface Feedback {
  is_satisfied: boolean
  is_resolved: boolean
  rating: number
  feedback_text: string | null
  would_recommend: boolean | null
  submitted_at: string
}

export interface ComplaintDetailData {
  id: string
  tracking_code: string
  title: string
  description: string
  status: ComplaintStatus
  priority: Priority
  source: ComplaintSource
  category_name: string
  subcategory_name: string | null
  ward_number: number | null
  ward_name: string | null
  department_name: string | null
  citizen_name: string
  assigned_staff_name: string | null
  submitted_at: string
  received_at: string | null
  assigned_at: string | null
  in_progress_at: string | null
  resolved_at: string | null
  closed_at: string | null
  sla_due_at: string | null
  is_escalated: boolean
  resolution_notes: string | null
  address_text: string | null
  landmark: string | null
  latitude: number | null
  longitude: number | null
}

export interface ComplaintDetail {
  complaint: ComplaintDetailData
  status_history: StatusHistoryEntry[]
  attachments: Attachment[]
  internal_comments: InternalComment[]
  feedback: Feedback | null
}

export interface Subcategory {
  id: string
  name: string
  name_nepali: string | null
  default_priority: Priority
  sla_days: number
}

export interface Category {
  id: string
  name: string
  name_nepali: string | null
  icon: string | null
  color: string | null
  complaint_subcategories: Subcategory[]
}

export interface Ward {
  id: string
  ward_number: number
  name: string
  name_nepali: string | null
}

export interface Department {
  id: string
  name: string
  name_nepali: string | null
  code: string
}

export interface AnalyticsSummary {
  total_complaints: number
  resolved: number
  in_progress: number
  overdue: number
  avg_resolution_days: number | null
}

export interface CategoryStat {
  category: string
  count: number
}

export interface WardStat {
  ward_number: number
  ward_name: string
  count: number
}

export interface StaffPerformer {
  staff_name: string
  resolved_count: number
  avg_resolution_days: number | null
}

export interface Analytics {
  summary: AnalyticsSummary
  by_status: Record<string, number>
  by_priority: Record<string, number>
  by_category: CategoryStat[]
  by_ward: WardStat[]
  top_performers: StaffPerformer[]
}

export interface StaffNotification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  action_url: string | null
  is_read: boolean
  read_at: string | null
  metadata: Record<string, any>
  created_at: string
}

export interface StaffWorkload {
  staff_id: string
  staff_name: string
  staff_email: string
  role_type: string
  total_assigned: number
  in_progress: number
  pending_acceptance: number
  completed_this_month: number
  overdue: number
  avg_resolution_days: number | null
}

export interface UserWithRoles {
  user_id: string
  email: string
  phone: string | null
  is_active: boolean
  is_verified: boolean
  full_name: string
  profile_photo_url: string | null
  language_preference: string
  roles: Array<{
    role_type: UserRole
    role_name: string
    permissions: Record<string, any>
  }>
  primary_role: UserRole
}

export interface SubmitComplaintParams {
  title: string
  description: string
  categoryId: string
  subcategoryId?: string
  wardId?: string
  latitude?: number
  longitude?: number
  address?: string
  landmark?: string
  priority?: Priority
}

export interface SubmitFeedbackParams {
  isSatisfied: boolean
  isResolved: boolean
  rating: number
  text?: string
  wouldRecommend?: boolean
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Base Supabase client hook - memoized for performance
 */
export function useSupabase() {
  const supabase = useMemo(() => createClient(), [])
  return supabase
}

/**
 * Get current authenticated user with all roles and profile info
 * Subscribes to auth state changes for automatic updates
 */
export function useCurrentUser() {
  const supabase = useSupabase()
  const [user, setUser] = useState<UserWithRoles | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadUser = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.rpc('get_current_user_with_roles')
      
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

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUser()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, loadUser])

  return { user, loading, error, refetch: loadUser }
}

// ============================================================================
// CITIZEN HOOKS - COMPLAINT SUBMISSION & MANAGEMENT
// ============================================================================

/**
 * Submit a new complaint as a citizen
 * Handles all parameters including location, ward, category, etc.
 */
export function useSubmitComplaint() {
  const supabase = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const submitComplaint = useCallback(async (params: SubmitComplaintParams) => {
    setLoading(true)
    setError(null)

    try {
      const { data: result, error } = await supabase.rpc('rpc_submit_complaint', {
        p_title: params.title,
        p_description: params.description,
        p_category_id: params.categoryId,
        p_subcategory_id: params.subcategoryId || null,
        p_ward_id: params.wardId || null,
        p_location_lat: params.latitude || null,
        p_location_lng: params.longitude || null,
        p_address_text: params.address || null,
        p_landmark: params.landmark || null,
        p_priority: params.priority || 'medium',
        p_source: 'web'
      })

      if (error) throw error

      toast({
        title: 'Success!',
        description: `Complaint submitted successfully. Tracking code: ${result.tracking_code}`,
      })

      return result
    } catch (err) {
      const error = err as Error
      setError(error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit complaint',
        variant: 'destructive'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  return { submitComplaint, loading, error }
}

/**
 * Upload attachment for a complaint
 * Handles file upload to Supabase Storage and creates database record
 */
export function useUploadAttachment() {
  const supabase = useSupabase()
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const uploadAttachment = useCallback(async (
    complaintId: string,
    file: File,
    userId: string
  ) => {
    setUploading(true)
    setProgress(0)

    try {
      // Generate unique file path
      const filePath = `${complaintId}/${Date.now()}_${file.name}`
      
      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('complaint-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      setProgress(50)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('complaint-attachments')
        .getPublicUrl(filePath)

      setProgress(75)

      // Insert metadata record
      const { data, error } = await supabase
        .from('complaint_attachments')
        .insert({
          complaint_id: complaintId,
          uploaded_by_user_id: userId,
          file_name: file.name,
          file_type: file.type.split('/')[0] || 'other',
          mime_type: file.type,
          file_size_bytes: file.size,
          file_url: publicUrl,
          storage_path: filePath
        })
        .select()
        .single()

      if (error) throw error

      setProgress(100)

      toast({
        title: 'Success',
        description: 'File uploaded successfully'
      })

      return data
    } catch (err) {
      const error = err as Error
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload file',
        variant: 'destructive'
      })
      throw error
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }, [supabase, toast])

  return { uploadAttachment, uploading, progress }
}

/**
 * Get citizen's own complaints with optional filters
 * Supports pagination and status filtering
 */
export function useMyComplaints(
  status?: ComplaintStatus,
  limit: number = 20,
  offset: number = 0
) {
  const supabase = useSupabase()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchComplaints = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.rpc('rpc_get_my_complaints', {
        p_status: status || null,
        p_limit: limit,
        p_offset: offset
      })

      if (error) throw error
      setComplaints(data || [])
    } catch (err) {
      setError(err as Error)
      setComplaints([])
    } finally {
      setLoading(false)
    }
  }, [supabase, status, limit, offset])

  useEffect(() => {
    fetchComplaints()
  }, [fetchComplaints])

  return { 
    complaints, 
    loading, 
    error, 
    refetch: fetchComplaints 
  }
}

/**
 * Get detailed information for a specific complaint
 * Includes status history, attachments, comments, and feedback
 */
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
      const { data, error } = await supabase.rpc('rpc_get_complaint_detail', {
        p_complaint_id: complaintId
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

  return { 
    complaint, 
    loading, 
    error, 
    refetch: fetchComplaint 
  }
}

/**
 * Submit citizen feedback for a resolved complaint
 * Includes satisfaction rating and optional comments
 */
export function useSubmitFeedback() {
  const supabase = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const submitFeedback = useCallback(async (
    complaintId: string,
    feedback: SubmitFeedbackParams
  ) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.rpc('rpc_submit_feedback', {
        p_complaint_id: complaintId,
        p_is_satisfied: feedback.isSatisfied,
        p_is_resolved: feedback.isResolved,
        p_rating: feedback.rating,
        p_feedback_text: feedback.text || null,
        p_would_recommend: feedback.wouldRecommend || null
      })

      if (error) throw error

      toast({
        title: 'Thank you!',
        description: 'Your feedback has been submitted successfully'
      })

      return data
    } catch (err) {
      const error = err as Error
      setError(error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit feedback',
        variant: 'destructive'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  return { submitFeedback, loading, error }
}

// ============================================================================
// STAFF HOOKS - QUEUE MANAGEMENT & COMPLAINT PROCESSING
// ============================================================================

/**
 * Get staff complaint queue (my tasks, team queue, or ward queue)
 * Supports filtering by status and priority
 */
export function useStaffQueue(
  queueType: QueueType = 'my_tasks',
  status?: ComplaintStatus,
  priority?: Priority,
  limit: number = 50,
  offset: number = 0
) {
  const supabase = useSupabase()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchQueue = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.rpc('rpc_get_staff_queue', {
        p_queue_type: queueType,
        p_status: status || null,
        p_priority: priority || null,
        p_limit: limit,
        p_offset: offset
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

  return { 
    complaints, 
    loading, 
    error, 
    refetch: fetchQueue 
  }
}

/**
 * Staff accepts an assigned complaint and moves it to in_progress
 */
export function useAcceptComplaint() {
  const supabase = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const acceptComplaint = useCallback(async (
    complaintId: string,
    userId: string,
    notes?: string
  ) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.rpc('staff_accept_complaint', {
        p_complaint_id: complaintId,
        p_staff_user_id: userId,
        p_notes: notes || null
      })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Complaint accepted and moved to in progress'
      })

      return data
    } catch (err) {
      const error = err as Error
      setError(error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept complaint',
        variant: 'destructive'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  return { acceptComplaint, loading, error }
}

/**
 * Staff rejects an assigned complaint with reason
 */
export function useRejectComplaint() {
  const supabase = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const rejectComplaint = useCallback(async (
    complaintId: string,
    userId: string,
    reason: string
  ) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.rpc('staff_reject_complaint', {
        p_complaint_id: complaintId,
        p_staff_user_id: userId,
        p_reason: reason
      })

      if (error) throw error

      toast({
        title: 'Complaint rejected',
        description: 'Assignment returned to pool'
      })

      return data
    } catch (err) {
      const error = err as Error
      setError(error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject complaint',
        variant: 'destructive'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  return { rejectComplaint, loading, error }
}

/**
 * Update complaint progress with work log notes
 */
export function useUpdateProgress() {
  const supabase = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateProgress = useCallback(async (
    complaintId: string,
    userId: string,
    note: string,
    attachments?: any
  ) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.rpc('update_complaint_progress', {
        p_complaint_id: complaintId,
        p_staff_user_id: userId,
        p_progress_note: note,
        p_attachments: attachments || null
      })

      if (error) throw error

      toast({
        title: 'Progress updated',
        description: 'Work log added successfully'
      })

      return data
    } catch (err) {
      const error = err as Error
      setError(error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to update progress',
        variant: 'destructive'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  return { updateProgress, loading, error }
}

/**
 * Mark complaint as resolved with resolution notes
 */
export function useResolveComplaint() {
  const supabase = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const resolveComplaint = useCallback(async (
    complaintId: string,
    resolutionNotes: string,
    attachments?: any
  ) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.rpc('rpc_resolve_complaint', {
        p_complaint_id: complaintId,
        p_resolution_notes: resolutionNotes,
        p_attachments: attachments || null
      })

      if (error) throw error

      toast({
        title: 'Success!',
        description: 'Complaint marked as resolved'
      })

      return data
    } catch (err) {
      const error = err as Error
      setError(error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to resolve complaint',
        variant: 'destructive'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  return { resolveComplaint, loading, error }
}

// ============================================================================
// SUPERVISOR/ADMIN HOOKS - ASSIGNMENT & WORKLOAD MANAGEMENT
// ============================================================================

/**
 * Assign or reassign complaint to specific staff member
 */
export function useAssignComplaint() {
  const supabase = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const assignComplaint = useCallback(async (
    complaintId: string,
    staffUserId: string,
    note?: string
  ) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.rpc('rpc_assign_complaint', {
        p_complaint_id: complaintId,
        p_staff_user_id: staffUserId,
        p_note: note || null
      })

      if (error) throw error

      toast({
        title: 'Assigned',
        description: 'Complaint assigned to staff member'
      })

      return data
    } catch (err) {
      const error = err as Error
      setError(error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign complaint',
        variant: 'destructive'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  return { assignComplaint, loading, error }
}

/**
 * Get unassigned complaints for a specific department
 */
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
      const { data, error } = await supabase.rpc(
        'get_unassigned_complaints_for_department',
        { p_department_id: departmentId }
      )

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

  return { 
    complaints, 
    loading, 
    error, 
    refetch: fetchUnassigned 
  }
}

/**
 * Get workload statistics for staff members
 * Can filter by specific staff member or get all
 */
export function useStaffWorkload(staffUserId?: string) {
  const supabase = useSupabase()
  const [workload, setWorkload] = useState<StaffWorkload[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchWorkload = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.rpc('get_staff_workload', {
        p_staff_user_id: staffUserId || null
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

  return { 
    workload, 
    loading, 
    error, 
    refetch: fetchWorkload 
  }
}

// ============================================================================
// ANALYTICS HOOKS (ADMIN)
// ============================================================================

/**
 * Get comprehensive complaint analytics
 * Supports filtering by date range, ward, and department
 */
export function useComplaintAnalytics(
  startDate?: string,
  endDate?: string,
  wardId?: string,
  departmentId?: string
) {
  const supabase = useSupabase()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.rpc('rpc_get_complaint_analytics', {
        p_start_date: startDate || null,
        p_end_date: endDate || null,
        p_ward_id: wardId || null,
        p_department_id: departmentId || null
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

  return { 
    analytics, 
    loading, 
    error, 
    refetch: fetchAnalytics 
  }
}

// ============================================================================
// REFERENCE DATA HOOKS
// ============================================================================

/**
 * Get all complaint categories with nested subcategories
 */
export function useCategories() {
  const supabase = useSupabase()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from('complaint_categories')
          .select(`
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
          `)
          .eq('is_active', true)
          .order('display_order')

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

/**
 * Get all wards ordered by ward number
 */
// ============================================================================
// SMART CITY POKHARA - COMPLETE COMPLAINT WORKFLOWS HOOKS LIBRARY
// File: app/(lib)/hooks/useComplaints.ts
// All complaint workloads & workflows implemented as React hooks
// Continue from useWards() cutoff section
// ============================================================================

/**
 * Get all wards ordered by ward number
 */
export function useWards() {
  const supabase = useSupabase()
  const [wards, setWards] = useState<Ward[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchWards() {
      try {
        const { data, error } = await supabase
          .from('wards')
          .select('id, ward_number, name, name_nepali')
          .eq('is_active', true)
          .order('ward_number')

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

/**
 * Get all departments ordered by name
 */
export function useDepartments() {
  const supabase = useSupabase()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('id, name, name_nepali, code')
          .eq('is_active', true)
          .order('name')

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
// STAFF NOTIFICATIONS HOOKS (REAL-TIME)
// ============================================================================

/**
 * Get staff notifications with real-time updates
 * Subscribes to new notifications and provides mark as read functionality
 */
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
        .from('staff_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.is_read).length || 0)
    } catch (err) {
      setError(err as Error)
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('staff_notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)

      if (error) throw error
      
      await fetchNotifications()
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }, [supabase, fetchNotifications])

  const markAllAsRead = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('staff_notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) throw error
      
      await fetchNotifications()
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }, [supabase, fetchNotifications])

  useEffect(() => {
    fetchNotifications()

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('staff-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'staff_notifications'
        },
        (payload) => {
          setNotifications(prev => [payload.new as StaffNotification, ...prev])
          setUnreadCount(prev => prev + 1)
        }
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
    markAllAsRead 
  }
}

// ============================================================================
// COMBINED WORKFLOW HOOKS - HIGH-LEVEL OPERATIONS
// ============================================================================

/**
 * Complete complaint lifecycle management for citizens
 * Combines submission, tracking, and feedback in one hook
 */
export function useCitizenComplaintWorkflow() {
  const { submitComplaint, loading: submitting } = useSubmitComplaint()
  const { uploadAttachment, uploading } = useUploadAttachment()
  const { submitFeedback, loading: feedbackSubmitting } = useSubmitFeedback()
  const { user } = useCurrentUser()

  const submitComplaintWithAttachments = useCallback(async (
    params: SubmitComplaintParams,
    files: File[]
  ) => {
    if (!user) throw new Error('User not authenticated')

    // Submit complaint first
    const result = await submitComplaint(params)
    
    // Upload attachments if any
    if (files.length > 0 && result.complaint_id) {
      const uploadPromises = files.map(file => 
        uploadAttachment(result.complaint_id, file, user.user_id)
      )
      await Promise.all(uploadPromises)
    }

    return result
  }, [submitComplaint, uploadAttachment, user])

  return {
    submitComplaintWithAttachments,
    submitFeedback,
    loading: submitting || uploading || feedbackSubmitting,
    user
  }
}

/**
 * Complete staff workload management
 * Combines queue viewing, acceptance, progress updates, and resolution
 */
export function useStaffWorkflowManager(queueType: QueueType = 'my_tasks') {
  const { complaints, loading: queueLoading, refetch: refetchQueue } = useStaffQueue(queueType)
  const { acceptComplaint, loading: accepting } = useAcceptComplaint()
  const { rejectComplaint, loading: rejecting } = useRejectComplaint()
  const { updateProgress, loading: updating } = useUpdateProgress()
  const { resolveComplaint, loading: resolving } = useResolveComplaint()
  const { user } = useCurrentUser()

  const handleAccept = useCallback(async (complaintId: string, notes?: string) => {
    if (!user) throw new Error('User not authenticated')
    await acceptComplaint(complaintId, user.user_id, notes)
    await refetchQueue()
  }, [acceptComplaint, user, refetchQueue])

  const handleReject = useCallback(async (complaintId: string, reason: string) => {
    if (!user) throw new Error('User not authenticated')
    await rejectComplaint(complaintId, user.user_id, reason)
    await refetchQueue()
  }, [rejectComplaint, user, refetchQueue])

  const handleUpdateProgress = useCallback(async (
    complaintId: string, 
    note: string, 
    attachments?: any
  ) => {
    if (!user) throw new Error('User not authenticated')
    await updateProgress(complaintId, user.user_id, note, attachments)
  }, [updateProgress, user])

  const handleResolve = useCallback(async (
    complaintId: string, 
    resolutionNotes: string,
    attachments?: any
  ) => {
    await resolveComplaint(complaintId, resolutionNotes, attachments)
    await refetchQueue()
  }, [resolveComplaint, refetchQueue])

  return {
    complaints,
    loading: queueLoading || accepting || rejecting || updating || resolving,
    handleAccept,
    handleReject,
    handleUpdateProgress,
    handleResolve,
    refetchQueue,
    user
  }
}

/**
 * Supervisor assignment and team management
 * Combines unassigned queue viewing and assignment operations
 */
export function useSupervisorWorkflow(departmentId: string | null) {
  const { complaints: unassigned, loading: unassignedLoading, refetch: refetchUnassigned } = 
    useUnassignedComplaints(departmentId)
  const { assignComplaint, loading: assigning } = useAssignComplaint()
  const { workload, loading: workloadLoading, refetch: refetchWorkload } = 
    useStaffWorkload()

  const handleAssign = useCallback(async (
    complaintId: string,
    staffUserId: string,
    note?: string
  ) => {
    await assignComplaint(complaintId, staffUserId, note)
    await Promise.all([refetchUnassigned(), refetchWorkload()])
  }, [assignComplaint, refetchUnassigned, refetchWorkload])

  const getAvailableStaff = useCallback(() => {
    return workload
      .filter(w => w.total_assigned < 10) // Max 10 concurrent assignments
      .sort((a, b) => a.total_assigned - b.total_assigned)
  }, [workload])

  return {
    unassignedComplaints: unassigned,
    staffWorkload: workload,
    availableStaff: getAvailableStaff(),
    loading: unassignedLoading || assigning || workloadLoading,
    handleAssign,
    refetchUnassigned,
    refetchWorkload
  }
}

/**
 * Admin dashboard with comprehensive analytics and management
 */
export function useAdminDashboard(
  startDate?: string,
  endDate?: string,
  wardId?: string,
  departmentId?: string
) {
  const { analytics, loading: analyticsLoading, refetch: refetchAnalytics } = 
    useComplaintAnalytics(startDate, endDate, wardId, departmentId)
  const { workload, loading: workloadLoading, refetch: refetchWorkload } = 
    useStaffWorkload()
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
    refreshAllData
  }
}

// ============================================================================
// UTILITY HOOKS FOR FILTERING AND SEARCH
// ============================================================================

/**
 * Filter complaints by multiple criteria
 */
export function useComplaintFilters(
  complaints: Complaint[],
  filters: {
    status?: ComplaintStatus[]
    priority?: Priority[]
    ward?: number[]
    searchTerm?: string
    dateFrom?: string
    dateTo?: string
  }
) {
  const filteredComplaints = useMemo(() => {
    let result = [...complaints]

    if (filters.status && filters.status.length > 0) {
      result = result.filter(c => filters.status!.includes(c.status))
    }

    if (filters.priority && filters.priority.length > 0) {
      result = result.filter(c => filters.priority!.includes(c.priority))
    }

    if (filters.ward && filters.ward.length > 0) {
      result = result.filter(c => c.ward_number && filters.ward!.includes(c.ward_number))
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      result = result.filter(c => 
        c.tracking_code.toLowerCase().includes(term) ||
        c.title.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term)
      )
    }

    if (filters.dateFrom) {
      result = result.filter(c => new Date(c.submitted_at) >= new Date(filters.dateFrom!))
    }

    if (filters.dateTo) {
      result = result.filter(c => new Date(c.submitted_at) <= new Date(filters.dateTo!))
    }

    return result
  }, [complaints, filters])

  return { filteredComplaints }
}

/**
 * Sort complaints by various criteria
 */
export function useComplaintSorting(
  complaints: Complaint[],
  sortBy: 'submitted_at' | 'updated_at' | 'sla_due_at' | 'priority' | 'status',
  sortOrder: 'asc' | 'desc' = 'desc'
) {
  const sortedComplaints = useMemo(() => {
    const result = [...complaints]

    result.sort((a, b) => {
      let compareValue = 0

      switch (sortBy) {
        case 'submitted_at':
        case 'updated_at':
        case 'sla_due_at':
          const dateA = new Date(a[sortBy] || 0).getTime()
          const dateB = new Date(b[sortBy] || 0).getTime()
          compareValue = dateA - dateB
          break

        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          compareValue = priorityOrder[a.priority] - priorityOrder[b.priority]
          break

        case 'status':
          compareValue = a.status.localeCompare(b.status)
          break
      }

      return sortOrder === 'asc' ? compareValue : -compareValue
    })

    return result
  }, [complaints, sortBy, sortOrder])

  return { sortedComplaints }
}

/**
 * Paginate complaints
 */
export function useComplaintPagination(
  complaints: Complaint[],
  pageSize: number = 20
) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(complaints.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize

  const paginatedComplaints = useMemo(() => {
    return complaints.slice(startIndex, endIndex)
  }, [complaints, startIndex, endIndex])

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }, [totalPages])

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
    hasPreviousPage: currentPage > 1
  }
}

// ============================================================================
// REAL-TIME COMPLAINT UPDATES
// ============================================================================

/**
 * Subscribe to real-time updates for a specific complaint
 */
export function useComplaintRealtimeUpdates(complaintId: string | null) {
  const supabase = useSupabase()
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const { refetch } = useComplaintDetail(complaintId)

  useEffect(() => {
    if (!complaintId) return

    const channel = supabase
      .channel(`complaint-${complaintId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaints',
          filter: `id=eq.${complaintId}`
        },
        () => {
          setLastUpdate(new Date())
          refetch()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'complaint_status_history',
          filter: `complaint_id=eq.${complaintId}`
        },
        () => {
          setLastUpdate(new Date())
          refetch()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, complaintId, refetch])

  return { lastUpdate }
}

/**
 * Subscribe to real-time queue updates
 */
export function useQueueRealtimeUpdates(queueType: QueueType, userId: string | null) {
  const supabase = useSupabase()
  const [hasNewComplaints, setHasNewComplaints] = useState(false)
  const { refetch } = useStaffQueue(queueType)

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`queue-${queueType}-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'complaints'
        },
        () => {
          setHasNewComplaints(true)
          refetch()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'complaints',
          filter: queueType === 'my_tasks' ? `assigned_staff_id=eq.${userId}` : undefined
        },
        () => {
          refetch()
        }
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
// EXPORT ALL HOOKS
// ============================================================================

export default {
  // Utility
  useSupabase,
  useCurrentUser,
  
  // Citizen workflows
  useSubmitComplaint,
  useUploadAttachment,
  useMyComplaints,
  useComplaintDetail,
  useSubmitFeedback,
  useCitizenComplaintWorkflow,
  
  // Staff workflows
  useStaffQueue,
  useAcceptComplaint,
  useRejectComplaint,
  useUpdateProgress,
  useResolveComplaint,
  useStaffWorkflowManager,
  
  // Supervisor workflows
  useAssignComplaint,
  useUnassignedComplaints,
  useStaffWorkload,
  useSupervisorWorkflow,
  
  // Admin workflows
  useComplaintAnalytics,
  useAdminDashboard,
  
  // Reference data
  useCategories,
  useWards,
  useDepartments,
  
  // Notifications
  useStaffNotifications,
  
  // Utilities
  useComplaintFilters,
  useComplaintSorting,
  useComplaintPagination,
  
  // Real-time
  useComplaintRealtimeUpdates,
  useQueueRealtimeUpdates
}