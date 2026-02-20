// features/staff/api.ts

import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/database.types";
import { 
  CreateStaffInput, 
  SupervisorJurisdiction, 
  AttendanceStats, 
  LeaveRequest,
  AdminStaffListItem,
  ComplaintMetrics,
  StatusDistribution,
  TrendPoint,
  RecentActivityItem,
  SupervisorTask
} from "./types";

export const staffApi = {

  // ==========================================
  // SUPERVISOR JURISDICTION HELPER
  // ==========================================
  
  async getSupervisorJurisdiction(client: SupabaseClient<Database>): Promise<SupervisorJurisdiction> {
    const { data, error } = await client.rpc("get_supervisor_jurisdiction").single();
    if (error || !data) {
      return { assigned_wards: [], assigned_departments: [], is_senior: false };
    }
    return {
      assigned_wards: (data as any).assigned_wards || [],
      assigned_departments: (data as any).assigned_departments || [],
      is_senior: (data as any).is_senior || false,
    };
  },

  // ==========================================
  // SUPERVISOR OVERVIEWS & DASHBOARD
  // ==========================================
  
  async getSupervisedStaff(client: SupabaseClient<Database>, supervisorId: string) {
     const scope = await this.getSupervisorJurisdiction(client);
     let query = client.from("staff_profiles").select(`
        *,
        user:users!staff_profiles_user_id_fkey(
           profile:user_profiles(full_name, profile_photo_url)
        )
     `).eq("is_active", true);

     if (!scope.is_senior) {
        const filters = [];
        if (scope.assigned_wards?.length) filters.push(`ward_id.in.(${scope.assigned_wards.join(',')})`);
        if (scope.assigned_departments?.length) filters.push(`department_id.in.(${scope.assigned_departments.join(',')})`);
        if (filters.length > 0) {
            query = query.or(filters.join(','));
        } else {
            return []; 
        }
     }
     
     const { data, error } = await query;
     if (error) throw error;
     
     return (data || []).map((s: any) => ({
        ...s,
        full_name: s.user?.profile?.full_name || "Staff Member",
        avatar_url: s.user?.profile?.profile_photo_url,
        role: s.staff_role || "Staff"
     }));
  },

  async getWorkloadStats(client: SupabaseClient<Database>, supervisorId: string) {
     const { data, error } = await client.rpc("rpc_get_staff_workload_stats", { p_supervisor_id: supervisorId });
     if (error) {
       console.error("Failed to get workload stats:", error);
       return { balanced: 0, overloaded: 0, underutilized: 0, avgWorkload: 0 };
     }
     return data;
  },

  async getStaffAttendanceOverview(client: SupabaseClient<Database>, supervisorId: string) {
    const scope = await this.getSupervisorJurisdiction(client);
    const today = new Date().toISOString().split("T")[0];

    // 1. Fetch supervised staff
    let staffQuery = client.from("staff_profiles").select("user_id, staff_role").eq("is_active", true);
    
    if (!scope.is_senior) {
        const filters = [];
        if (scope.assigned_wards?.length) filters.push(`ward_id.in.(${scope.assigned_wards.join(',')})`);
        if (scope.assigned_departments?.length) filters.push(`department_id.in.(${scope.assigned_departments.join(',')})`);
        if (filters.length > 0) {
            staffQuery = staffQuery.or(filters.join(','));
        } else {
            return []; 
        }
    }
    
    const { data: staffData } = await staffQuery;
    if (!staffData || staffData.length === 0) return [];
    
    const staffIds = staffData.map((s: any) => s.user_id);

    // 2. Fetch today's logs for these staff members
    const { data: logs, error } = await client
      .from("attendance_logs")
      .select(`
        *,
        user:users!attendance_logs_staff_id_fkey(
           profile:user_profiles(full_name, profile_photo_url)
        )
      `)
      .in("staff_id", staffIds)
      .eq("date", today);

    if (error) throw error;
    
    // 3. Map data strictly to frontend expectations
    return (logs || []).map((log: any) => ({
       user_id: log.staff_id,
       full_name: log.user?.profile?.full_name || "Unknown Staff",
       avatar_url: log.user?.profile?.profile_photo_url,
       role: staffData.find((s: any) => s.user_id === log.staff_id)?.staff_role || "Staff",
       computedStatus: !log.check_out_time ? 'on_duty' : 'checked_out',
       attendance: log
    }));
  },

  // ==========================================
  // STAFF LISTS & PROFILES
  // ==========================================
  
  async getStaffDetails(client: SupabaseClient<Database>, staffId: string) {
      const { data: staff, error } = await client
        .from("staff_profiles")
        .select(`
          *, 
          ward:wards(name, ward_number), 
          department:departments(name),
          user:users!staff_profiles_user_id_fkey(phone, email),
          profile:user_profiles!staff_profiles_user_profile_fkey(full_name, profile_photo_url)
        `)
        .eq("user_id", staffId)
        .single();
      
      if (error) return null;

      const today = new Date().toISOString().split("T")[0];
      const [attendance, leaves] = await Promise.all([
          client.from("attendance_logs").select("*").eq("staff_id", staffId).eq("date", today).maybeSingle(),
          client.from("leave_requests").select("*").eq("staff_id", staffId).eq("status", "pending")
      ]);

      const profile = (staff as any)?.profile; 

      return {
        profile: {
          ...staff,
          full_name: profile?.full_name || "Unknown Staff",
          avatar_url: profile?.profile_photo_url,
          ward_name: (staff as any)?.ward ? `Ward ${(staff as any).ward.ward_number}` : "HQ",
        },
        attendance: (attendance as any)?.data,
        pending_leaves: (leaves as any)?.data || [],
      };
  },

  async getStaffForSelection(client: SupabaseClient<Database>) {
    const { data, error } = await client
      .from("staff_profiles")
      .select(`
        user_id,
        profile:user_profiles!staff_profiles_user_profile_fkey(full_name)
      `)
      .eq("is_active", true);

    if (error) throw error;
    return (data || []).map((s: any) => ({
      user_id: s.user_id,
      full_name: s.profile?.full_name || "Unknown Staff"
    }));
  },

  // ==========================================
  // ATTENDANCE MANAGEMENT
  // ==========================================
 // ==========================================
  // ATTENDANCE MANAGEMENT
  // ==========================================
  
  async getTodayStatus(client: SupabaseClient<Database>, staffId: string) {
    // 1. Fetch the absolute latest log, regardless of UTC date
    const { data, error } = await client
      .from("attendance_logs")
      .select("id, date, check_in_time, check_out_time, check_in_location")
      .eq("staff_id", staffId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) return null;

    // 2. If there is no check_out_time, they are actively On Duty right now
    if (!data.check_out_time) {
      return { ...(data as any), on_duty: true };
    }

    // 3. If they HAVE checked out, check if that log was from "Today" (Local Time)
    // en-CA format yields YYYY-MM-DD exactly according to local timezone
    const todayLocal = new Date().toLocaleDateString('en-CA');
    if (!data.check_in_time) return null;
    const logDateLocal = new Date(data.check_in_time as string).toLocaleDateString('en-CA');

    if (todayLocal === logDateLocal) {
      // Shift completed for today
      return { ...(data as any), on_duty: false };
    }

    // It is a new day, and they haven't checked in yet
    return null; 
  },

  async checkIn(client: SupabaseClient<Database>, lat: number, lng: number, deviceId = "browser") {
      const { error } = await client.rpc("rpc_staff_check_in", { p_lat: lat, p_lng: lng, p_device_id: deviceId });
      if (error) throw error;
  },

  async checkOut(client: SupabaseClient<Database>, lat: number, lng: number) {
      const { data, error } = await client.rpc("rpc_staff_check_out", { p_lat: lat, p_lng: lng });
      if (error) throw error;
      return data;
  },

  async getAttendanceHistory(client: SupabaseClient<Database>, staffId: string, limit = 15) {
      const { data, error } = await client
        .from("attendance_logs")
        .select("*")
        .eq("staff_id", staffId)
        .order("created_at", { ascending: false }) // Use created_at instead of date for accurate sorting
        .limit(limit);
      
      if (error) throw error;
      return (data || []) as any[];
  },

  async getAttendanceStats(
    client: SupabaseClient<Database>,
    staffId: string
  ): Promise<AttendanceStats & { check_in_time: string | null; check_out_time: string | null; check_in_location: any; daysWorked: number; totalHours: number }> {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];

    const { count: presentDays } = await client
      .from("attendance_logs")
      .select("*", { count: "exact", head: true })
      .eq("staff_id", staffId)
      .eq("status", "present")
      .gte("date", firstDayOfMonth);

    const { count: lateDays } = await client
      .from("attendance_logs")
      .select("*", { count: "exact", head: true })
      .eq("staff_id", staffId)
      .eq("status", "late") 
      .gte("date", firstDayOfMonth);

    const { data: monthLogs } = await client
      .from("attendance_logs")
      .select("total_hours")
      .eq("staff_id", staffId)
      .gte("date", firstDayOfMonth);

    // Calculate total hours safely
    const totalMonthHours = (monthLogs || []).reduce((sum: number, log: any) => sum + (Number(log.total_hours) || 0), 0);

    const todayLog = await this.getTodayStatus(client, staffId);

    let todayHours = 0;
    if (todayLog?.check_in_time && todayLog?.check_out_time) {
      const inTime = new Date(todayLog.check_in_time).getTime();
      const outTime = new Date(todayLog.check_out_time).getTime();
      todayHours = Math.max(0, (outTime - inTime) / (1000 * 60 * 60));
    }

    return {
      daysWorked: (presentDays || 0) + (lateDays || 0), 
      totalHours: totalMonthHours, 
      present_days: presentDays || 0,
      late_days: lateDays || 0,
      on_duty: todayLog?.on_duty || false,
      today_hours: Number(todayHours.toFixed(2)),
      check_in_time: todayLog?.check_in_time || null,
      check_out_time: todayLog?.check_out_time || null,
      check_in_location: todayLog?.check_in_location || null,
    };
  },
  // ==========================================
  // LEAVE MANAGEMENT
  // ==========================================
  
  async getLeaveBalance(client: SupabaseClient<Database>, staffId: string) {
      const { data, error } = await client.from("leave_balances").select("*").eq("staff_id", staffId).maybeSingle();
      if (error) throw error;
      return (data as any) || {
        annual_allowed: 15, annual_used: 0,
        sick_allowed: 12, sick_used: 0,
        casual_allowed: 6, casual_used: 0,
        staff_id: staffId, created_at: "", updated_at: ""
      };
  },

  async requestLeave(client: SupabaseClient<Database>, input: { staffId: string, type: string, startDate: string, endDate: string, reason: string }) {
      const { data, error } = await client.from("leave_requests").insert({
          staff_id: input.staffId,
          type: input.type as any, 
          start_date: input.startDate,
          end_date: input.endDate,
          reason: input.reason,
          status: "pending"
      }).select().single();
      if (error) throw error;
      return data;
  },

  async updateLeaveStatus(client: SupabaseClient<Database>, leaveId: string, status: "approved" | "rejected", supervisorId: string) {
      const { error } = await client.from("leave_requests").update({
          status: status,
          approved_by: supervisorId,
          updated_at: new Date().toISOString()
      }).eq("id", leaveId);
      
      if (error) throw error;
  },

  /**
   * FIXED: Correct foreign key routing for pending leaves
   */
  async getPendingLeaves(client: SupabaseClient<Database>, staffIds: string[]) {
    if (!staffIds || staffIds.length === 0) return [];
    
    const { data, error } = await client
      .from("leave_requests")
      .select(`
        *,
        staff_user:users!leave_requests_staff_id_fkey(
           profile:user_profiles(full_name, profile_photo_url)
        )
      `)
      .in("staff_id", staffIds)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    
    if (error) throw error;

    // Transform mapping so it perfectly matches what the UI expects
    return (data || []).map((l: any) => ({
      ...l,
      staff: {
        user: {
          profile: {
            full_name: l.staff_user?.profile?.full_name || "Unknown Staff",
            profile_photo_url: l.staff_user?.profile?.profile_photo_url
          }
        }
      }
    }));
  },

  async getActiveRequests(client: SupabaseClient<Database>, staffId: string) {
    const { data, error } = await client
      .from("leave_requests")
      .select("*")
      .eq("staff_id", staffId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return (data || []) as LeaveRequest[];
  },

  async getRequestHistory(client: SupabaseClient<Database>, staffId: string) {
    const { data, error } = await client
      .from("leave_requests")
      .select("*")
      .eq("staff_id", staffId)
      .neq("status", "pending")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return (data || []) as LeaveRequest[];
  },

  // ==========================================
  // ADMIN STAFF MANAGEMENT
  // ==========================================
  
  async updateStaff(client: SupabaseClient<Database>, id: string, updates: any) {
    const { error } = await client.rpc("rpc_update_staff_role" as any, {
      p_user_id: id,
      p_staff_role: updates.staff_role || null,
      p_department_id: updates.department_id || null,
      p_ward_id: updates.ward_id || null,
      p_is_supervisor: updates.is_supervisor || false,
      p_is_active: updates.is_active
    });
    
    if (error) throw error;
  },

  async getDepartments(client: SupabaseClient<Database>) {
    const { data, error } = await client.from("departments").select("id, name").order("name");
    if (error) throw error;
    return data as any[];
  },

  async getWards(client: SupabaseClient<Database>) {
    const { data, error } = await client.from("wards").select("id, ward_number, name").order("ward_number");
    if (error) throw error;
    return data as any[];
  },

  async registerStaff(client: SupabaseClient<Database>, input: CreateStaffInput) {
      return client.rpc("rpc_register_staff" as any, {
          p_email: input.email,
          p_full_name: input.full_name,
          p_staff_role: input.staff_role,
          p_phone: input.phone || null,
          p_department_id: input.department_id || null,
          p_ward_id: input.ward_id || null,
          p_is_supervisor: input.is_supervisor,
          p_specializations: input.specializations || null,
          p_employment_date: null,
          p_created_by: input.createdBy || null
      });
  },

  async getAllStaff(client: SupabaseClient<Database>, filters?: { role?: string; department_id?: string; ward_id?: string; search?: string }) {
    let query = client
      .from("staff_profiles")
      .select(`
        *,
        user:users!staff_profiles_user_id_fkey(phone, email),
        profile:user_profiles!staff_profiles_user_profile_fkey(full_name, profile_photo_url),
        department:departments(name)
      `)
      .eq("is_active", true);

    if (filters?.role && filters.role !== 'all') query = query.eq("staff_role", filters.role as any);
    if (filters?.department_id) query = query.eq("department_id", filters.department_id as any);
    if (filters?.ward_id) query = query.eq("ward_id", filters.ward_id);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((s: any) => ({
      user_id: s.user_id,
      email: s.user?.email || "",
      full_name: s.profile?.full_name || "Unknown",
      phone: s.user?.phone || null,
      staff_code: s.staff_code,
      staff_role: s.staff_role as any,
      department_name: s.department?.name || null,
      ward_number: s.ward_id ? parseInt(s.ward_id) : null, 
      is_supervisor: false, 
      is_active: s.is_active || false,
      availability_status: 'available' as const, 
      current_workload: 0, 
      created_at: s.created_at || new Date().toISOString(),
      avatar_url: s.profile?.profile_photo_url
    } as AdminStaffListItem));
  },

  // ==========================================
  // PERFORMANCE
  // ==========================================
  
  async getPerformanceStats(client: SupabaseClient<Database>, staffId: string) {
      const { data, error } = await client.from("mv_staff_performance").select("*").eq("user_id", staffId).maybeSingle();
      if (error && error.code !== "PGRST116") throw error;
      return data;
  },

  async getStaffPerformance(client: SupabaseClient<Database>, staffId: string) {
    const { data: resolved, error } = await client
      .from("complaints")
      .select("id, tracking_code, submitted_at, resolved_at, sla_due_at")
      .eq("assigned_staff_id", staffId)
      .eq("status", "resolved")
      .order("resolved_at", { ascending: false });

    if (error) throw error;
    return { resolved: resolved || [] };
  },

  async getStaffById(client: SupabaseClient<Database>, staffId: string) {
      const { data, error } = await client
        .from("user_profiles")
        .select(`
            user_id, 
            full_name, 
            profile_photo_url,
            staff:staff_profiles(staff_code, staff_role, availability_status, performance_rating)
        `)
        .eq("user_id", staffId)
        .single();
      
      if (error) return null;
      return {
        ...data,
        performance_rating: (data.staff as any)?.performance_rating
      };
  },

  async getMyPerformance(client: SupabaseClient<Database>, userId: string) {
      return {
          rating: 4.8,
          tasks_completed: 124,
          on_time_percentage: 92,
          attendance_rate: 98,
          totalCompleted: 124,
          slaCompliance: 92,
          avgResolutionTime: 24, 
          avgRating: 4.8
      };
  },

  async getAchievements(client: SupabaseClient<Database>, userId: string) {
       return [
           { id: "1", badge_name: "Early Bird", icon_key: "sun", earned_at: "2024-02-10", description: "Checked in before 8 AM for 5 days in a row" },
           { id: "2", badge_name: "Speedster", icon_key: "zap", earned_at: "2024-02-15", description: "Resolved 5 tasks in a single day" }
       ];
  },

  async getCompletionStats(client: SupabaseClient<Database>, userId: string) {
      const today = new Date().toISOString().split("T")[0];
      
      const { count: tasks } = await client
        .from("supervisor_tasks")
        .select("*", { count: "exact", head: true })
        .eq("primary_assigned_to", userId)
        .eq("status", "completed")
        .gte("updated_at", today); 

      const { count: complaints } = await client
        .from("complaints")
        .select("*", { count: "exact", head: true })
        .eq("assigned_staff_id", userId)
        .eq("status", "resolved")
        .gte("resolved_at", today);

      return {
          completed_today: (tasks || 0) + (complaints || 0)
      };
  },

  async getUpcomingShifts(client: SupabaseClient<Database>, userId: string) {
       return [
           { id: "s1", date: new Date().toISOString().split("T")[0], start: "09:00", end: "17:00", type: "Regular", location: "Office" },
           { id: "s2", date: new Date(Date.now() + 86400000).toISOString().split("T")[0], start: "09:00", end: "17:00", type: "Regular", location: "Field" }
       ];
  },

  async getFullSchedule(client: SupabaseClient<Database>, userId: string, start: string, end: string) {
       return {
           shifts: [
               { id: "s1", date: start.split("T")[0], start: "09:00", end: "17:00", title: "Regular Shift", type: "shift" }
           ],
           tasks: []
       };
  },
  
  async getUpcomingTasks(client: SupabaseClient<Database>, userId: string) {
      const { data } = await client
        .from("supervisor_tasks")
        .select("id, title, due_date, priority")
        .eq("primary_assigned_to", userId)
        .neq("status", "completed")
        .order("due_date", { ascending: true })
        .limit(3);
      return (data || []) as any[];
  },

  // ==========================================
  // QUEUE & ASSIGNMENTS
  // ==========================================

  async getStaffAssignments(client: SupabaseClient<Database>, staffId: string) {
    const { data, error } = await client
      .from("staff_work_assignments")
      .select(`
        id, assignment_status, priority, due_at, completion_percentage, created_at,
        complaint:complaints(id, tracking_code, title, location_point, address_text, category:complaint_categories(name)),
        task:supervisor_tasks(id, tracking_code, title, location_point, address_text, task_type)
      `)
      .eq("staff_id", staffId)
      .not("assignment_status", "in", '("cancelled","rejected")')
      .order("priority", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) return [];

    return (data || []).map((item: any) => ({
      id: item.id,
      type: item.complaint ? "complaint" : "task",
      reference_id: item.complaint?.id || item.task?.id,
      tracking_code: item.complaint?.tracking_code || item.task?.tracking_code,
      title: item.complaint?.title || item.task?.title || "Untitled Assignment",
      category: item.complaint?.category?.name || item.task?.task_type?.replace(/_/g, " ") || "General",
      location: item.complaint?.address_text || item.task?.address_text || "No location provided",
      coordinates: item.complaint?.location_point || item.task?.location_point,
      status: item.assignment_status,
      priority: item.priority,
      due_at: item.due_at,
      assigned_at: item.created_at,
      completion: item.completion_percentage,
    }));
  },

  async getTeamAssignments(client: SupabaseClient<Database>, staffId: string) {
    const { data: profile } = await client
      .from("staff_profiles")
      .select("ward_id, department_id")
      .eq("user_id", staffId)
      .single();

    if (!profile) return [];

    let query = client
      .from("staff_work_assignments")
      .select(`
        id, assignment_status, priority, due_at, completion_percentage, created_at,
        staff:staff_profiles!inner(user_id, user:users(profile:user_profiles(full_name, avatar_url))),
        complaint:complaints(id, tracking_code, title, location_point, address_text, category:complaint_categories(name)),
        task:supervisor_tasks(id, tracking_code, title, location_point, address_text, task_type)
      `)
      .neq("staff_id", staffId)
      .not("assignment_status", "in", '("cancelled","rejected")')
      .limit(50);

    if ((profile as any).ward_id) query = query.eq("staff.ward_id", (profile as any).ward_id);
    else if ((profile as any).department_id) query = query.eq("staff.department_id", (profile as any).department_id);
    else return [];

    const { data, error } = await query;
    if (error) return [];

    return (data || []).map((item: any) => ({
      id: item.id,
      type: item.complaint ? "complaint" : "task",
      reference_id: item.complaint?.id || item.task?.id,
      title: item.complaint?.title || item.task?.title,
      status: item.assignment_status,
      priority: item.priority,
      assignee: {
        name: item.staff?.user?.profile?.full_name || "Unknown",
        avatar: item.staff?.user?.profile?.avatar_url,
      },
    }));
  },

  async getAssignmentById(client: SupabaseClient<Database>, assignmentId: string) {
    const { data, error } = await client
      .from("staff_work_assignments")
      .select(`
      *,
      complaint:complaints(
        id, tracking_code, title, description, status, priority, 
        address_text, location_point, ward:wards(ward_number, name),
        citizen:users!complaints_citizen_id_fkey(phone, email, profile:user_profiles(full_name)),
        attachments:complaint_attachments(id, file_path, file_name, file_type, created_at)
      ),
      task:supervisor_tasks(
        id, tracking_code, title, description, status, priority,
        address_text, location_point, task_type
      ),
      assigned_by_user:users!staff_work_assignments_assigned_by_fkey(
        profile:user_profiles(full_name)
      )
    `)
      .eq("id", assignmentId)
      .maybeSingle();

    if (error || !data) return null;

    const base = (data as any).complaint || (data as any).task;
    if (!base) return null;

    return {
      id: (data as any).id,
      staff_id: (data as any).staff_id,
      complaint_id: (data as any).complaint?.id,
      type: (data as any).complaint ? "complaint" : "task",
      title: base.title,
      description: base.description,
      tracking_code: base.tracking_code,
      status: (data as any).assignment_status,
      priority: (data as any).priority,
      due_at: (data as any).due_at,
      location: base.address_text,
      coordinates: base.location_point,
      ward: (data as any).complaint ? `Ward ${base.ward?.ward_number}` : "N/A",
      assigned_at: (data as any).assigned_at,
      started_at: (data as any).started_at,
      completed_at: (data as any).completed_at,
      citizen: (data as any).complaint ? {
            name: base.citizen?.profile?.full_name || "Unknown",
            phone: base.citizen?.phone,
            email: base.citizen?.email,
          } : null,
      assigned_by_name: (data as any).assigned_by_user?.profile?.full_name || "Supervisor",
      instructions: (data as any).assignment_notes,
      attachments: (data as any).complaint?.attachments || [],
    };
  },

  async startAssignment(client: SupabaseClient<Database>, assignmentId: string, location?: { lat: number; lng: number }) {
    const locationJson = location ? { type: "Point", coordinates: [location.lng, location.lat] } : null;
    const { data, error } = await client.rpc("rpc_start_assignment", {
      p_assignment_id: assignmentId,
      p_checkin_location: locationJson,
    });
    if (error) throw error;
    return data;
  },

  async uploadWorkPhoto(client: SupabaseClient<Database>, staffId: string, file: File) {
    const fileExt = file.name.split(".").pop();
    const path = `${staffId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const { error: uploadError } = await client.storage.from("staff-work-photos").upload(path, file);
    if (uploadError) throw uploadError;
    const { data } = client.storage.from("staff-work-photos").getPublicUrl(path);
    return (data as any).publicUrl;
  },

  async completeAssignment(client: SupabaseClient<Database>, assignmentId: string, notes: string, photos: string[] = []) {
    const { data, error } = await client.rpc("rpc_complete_assignment", {
      p_assignment_id: assignmentId,
      p_resolution_notes: notes,
      p_photos: photos,
      p_materials_used: [],
    });
    if (error) throw new Error((error as any).message || "Unknown database error occurred");
    return data;
  },

  // ==========================================
  // MESSAGES & COMMUNICATION
  // ==========================================

  async getConversations(client: SupabaseClient<Database>, userId: string) {
    const { data: convs, error } = await client
      .from("message_conversations")
      .select("*")
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order("last_message_at", { ascending: false });

    if (error || !convs || convs.length === 0) return [];

    const otherIds = (convs as any[]).map((c) => c.participant_1 === userId ? c.participant_2 : c.participant_1);

    const { data: profiles } = await client
      .from("user_profiles")
      .select("user_id, full_name, profile_photo_url")
      .in("user_id", otherIds);

    const profileMap = new Map((profiles as any[])?.map((p) => [p.user_id, p]));

    return (convs as any[]).map((c) => {
      const otherId = c.participant_1 === userId ? c.participant_2 : c.participant_1;
      const profile = profileMap.get(otherId);
      return {
        id: c.id,
        otherUserName: (profile as any)?.full_name || "Staff Member",
        otherUserAvatar: (profile as any)?.profile_photo_url,
        lastMessage: c.last_message_preview,
        lastMessageTime: c.last_message_at,
        metadata: { otherUserId: otherId }
      };
    });
  },

  async createConversation(client: SupabaseClient<Database>, user1: string, user2: string) {
    const { data: existing } = await client
      .from("message_conversations")
      .select("id")
      .or(`and(participant_1.eq.${user1},participant_2.eq.${user2}),and(participant_1.eq.${user2},participant_2.eq.${user1})`)
      .maybeSingle();

    if (existing) return (existing as any).id;

    const { data: newConv, error } = await client
      .from("message_conversations")
      .insert({ participant_1: user1, participant_2: user2, last_message_at: new Date().toISOString() })
      .select("id")
      .single();

    if (error) throw error;
    return (newConv as any).id;
  },

  async getMessages(client: SupabaseClient<Database>, conversationId: string) {
    const { data, error } = await client
      .from("supervisor_staff_messages")
      .select(`
        id, sender_id, message_text, created_at, is_read,
        sender:users!supervisor_staff_messages_sender_id_fkey(
           profile:user_profiles(full_name, profile_photo_url)
        )
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return (data || []).map((msg: any) => ({
      id: msg.id,
      content: msg.message_text,
      senderId: msg.sender_id,
      senderName: msg.sender?.profile?.full_name || "User",
      senderAvatar: msg.sender?.profile?.profile_photo_url,
      createdAt: msg.created_at,
      isRead: msg.is_read
    }));
  },

  async sendMessage(client: SupabaseClient<Database>, conversationId: string, senderId: string, text: string) {
    const { data, error } = await client
      .from("supervisor_staff_messages")
      .insert({ conversation_id: conversationId, sender_id: senderId, message_text: text })
      .select()
      .single();

    if (error) throw error;

    await client.from("message_conversations").update({
        last_message_at: new Date().toISOString(),
        last_message_preview: text.substring(0, 50),
    }).eq("id", conversationId);

    return data;
  },

  async markMessagesAsRead(client: SupabaseClient<Database>, conversationId: string, userId: string) {
    await client
      .from("supervisor_staff_messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", userId)
      .eq("is_read", false);
  },

  async broadcastMessage(client: SupabaseClient<Database>, payload: { senderId: string; title: string; body: string; recipients: string[]; urgency?: string; isScheduled?: boolean; }) {
    const { data, error } = await (client as any)
      .from("team_announcements")
      .insert({
        supervisor_id: payload.senderId,
        title: payload.title,
        content: payload.body,
        target_staff_ids: payload.recipients,
        announcement_type: (payload.urgency === "urgent" ? "urgent" : "general"),
        is_published: !payload.isScheduled,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getBroadcastHistory(client: SupabaseClient<Database>, supervisorId: string) {
    const { data, error } = await (client as any)
      .from("team_announcements")
      .select("*")
      .eq("supervisor_id", supervisorId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as any[];
  },

  // ==========================================
  // SUPERVISOR TASK MANAGEMENT
  // ==========================================

  async getSupervisorTasks(client: SupabaseClient<Database>, supervisorId: string, filters?: any): Promise<SupervisorTask[]> {
    let query = client.from("supervisor_tasks").select(`*, ward:wards(name)`).eq("supervisor_id", supervisorId).order("due_date", { ascending: true });

    if (filters) {
      if (filters.status?.length) query = query.in("status", filters.status);
      if (filters.priority?.length) query = query.in("priority", filters.priority);
      if (filters.task_type?.length) query = query.in("task_type", filters.task_type);
      if (filters.assigned_to) query = query.contains("assigned_to", [filters.assigned_to]);
      if (filters.search) query = query.or(`title.ilike.%${filters.search}%,tracking_code.ilike.%${filters.search}%`);
    }

    const { data: tasks, error } = await query;
    if (error) throw error;
    if (!tasks) return [];

    const staffIds = [...new Set((tasks as any[]).map((t) => t.primary_assigned_to).filter(Boolean))];
    if (staffIds.length === 0) return tasks as any;

    const { data: staffProfiles } = await client.from("user_profiles").select("user_id, full_name").in("user_id", staffIds);
    const profileMap = new Map((staffProfiles as any[])?.map(p => [p.user_id, p.full_name]));

    return (tasks as any[]).map(t => ({
      ...t,
      primary_assigned: t.primary_assigned_to ? {
        user_id: t.primary_assigned_to,
        full_name: profileMap.get(t.primary_assigned_to) || "Unknown"
      } : null
    }));
  },

  async createTask(client: SupabaseClient<Database>, input: any) {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const trackingCode = `TSK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const { data, error } = await client.from("supervisor_tasks").insert({
        tracking_code: trackingCode,
        supervisor_id: user.id,
        ...input,
        status: "not_started"
    }).select().single();

    if (error) throw error;

    if (input.primary_assigned_to && data) {
       await client.from("staff_work_assignments").insert({
         staff_id: input.primary_assigned_to,
         task_id: (data as any).id,
         assignment_status: "not_started",
         priority: input.priority,
         due_at: input.due_date,
         assigned_by: user.id
       });
    }

    return data;
  },

  async updateTask(client: SupabaseClient<Database>, taskId: string, updates: any) {
    const { data, error } = await client.from("supervisor_tasks").update(updates).eq("id", taskId).select().single();
    if (error) throw error;
    return data;
  },

  async deleteTask(client: SupabaseClient<Database>, taskId: string) {
    const { error } = await client.from("supervisor_tasks").delete().eq("id", taskId);
    if (error) throw error;
  }
};