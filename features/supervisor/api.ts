// features/supervisor/api.ts

import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/database.types";
import { subDays, format } from "date-fns";
import { cache } from "react";

type ComplaintStatus =
  | "pending"
  | "under_review"
  | "rejected"
  | "in_progress"
  | "received"
  | "assigned"
  | "resolved"
  | "closed"
  | "reopened";

/** Statuses that are considered "overdue" by business logic */
const OVERDUE_STATUSES: ComplaintStatus[] = [
  "received",
  "assigned",
  "in_progress",
  "under_review",
  "reopened",
];

// ==========================================
// INTERNAL CACHED FETCHERS (Server Only)
// ==========================================

export const getCachedJurisdiction = cache(async (client: SupabaseClient<Database>, supervisorId: string) => {
  const { data, error } = await client
    .from("supervisor_profiles")
    .select("assigned_wards, assigned_departments, supervisor_level")
    .eq("user_id", supervisorId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[SupervisorAPI] Jurisdiction fetch error:", error);
    return { is_senior: false, wards: [] as string[], depts: [] as string[] };
  }

  return {
    is_senior: data.supervisor_level === "senior",
    wards: (data.assigned_wards as string[]) || [],
    depts: (data.assigned_departments as string[]) || [],
  };
});

export const supervisorApi = {

  // ==========================================
  // 1. JURISDICTION HELPER
  // ==========================================
  async getJurisdiction(client: SupabaseClient<Database>, supervisorId: string) {
    // Rely on the cached internal helper to prevent 4x duplicate fetches
    return getCachedJurisdiction(client, supervisorId);
  },

  // ==========================================
  // 2. DASHBOARD METRICS
  // ==========================================
  async getComplaintMetrics(client: SupabaseClient<Database>, supervisorId: string) {
    const { data, error } = await client.rpc("rpc_get_supervisor_dashboard_v2", {
      p_supervisor_id: supervisorId,
    });

    if (error) {
      console.error("[RPC] rpc_get_supervisor_dashboard_v2 failed:", error);
    }

    if (!data) {
      return {
        activeCount: 0,
        unassignedCount: 0,
        overdueCount: 0,
        resolvedTodayCount: 0,
        slaComplianceRate: 100,
      };
    }

    const metrics = data as {
      active_complaints?: number;
      unassigned_complaints?: number;
      overdue_complaints?: number;
      resolved_today?: number;
      avg_resolution_hours?: number;
    };

    const totalForSla =
      (metrics.active_complaints ?? 0) +
      (metrics.resolved_today ?? 0) +
      (metrics.overdue_complaints ?? 0);

    const compliance =
      totalForSla > 0
        ? Math.round(
            ((totalForSla - (metrics.overdue_complaints ?? 0)) / totalForSla) * 100
          )
        : 100;

    return {
      activeCount: metrics.active_complaints ?? 0,
      unassignedCount: metrics.unassigned_complaints ?? 0,
      overdueCount: metrics.overdue_complaints ?? 0,
      resolvedTodayCount: metrics.resolved_today ?? 0,
      avgResolutionTimeHours: metrics.avg_resolution_hours ?? 0,
      slaComplianceRate: compliance,
    };
  },

  async getAggregatedMetrics(client: SupabaseClient<Database>) {
    const { count: total } = await client
      .from("complaints")
      .select("*", { count: "exact", head: true });

    const { count: resolved } = await client
      .from("complaints")
      .select("*", { count: "exact", head: true })
      .eq("status", "resolved");

    return {
      totalComplaints: total ?? 0,
      resolutionRate: total
        ? Math.round(((resolved ?? 0) / total) * 100)
        : 0,
      avgResolutionTime: 24,   // Placeholder
      slaCompliance: 92,        // Placeholder
      citizenSatisfaction: 4.5, // Placeholder
    };
  },

  // ==========================================
  // 3. STAFF & ATTENDANCE MANAGEMENT
  // ==========================================
  async getSupervisedStaff(client: SupabaseClient<Database>, supervisorId: string) {
    try {
      // 1. Get Supervisor Jurisdiction
      const { data: jur, error: jurErr } = await client
        .from("supervisor_profiles")
        .select("assigned_wards, assigned_departments, supervisor_level")
        .eq("user_id", supervisorId)
        .maybeSingle();

      if (jurErr || !jur) {
        if (jurErr) console.error("[SupervisorAPI] Jurisdiction lookup failed:", jurErr);
        // Fallback for senior admins or users without explicit profiles
        return [];
      }

      // 2. Query Staff matching wards or depts
      let query = client.from("staff_profiles").select(`
        *,
        user:users!inner(
          profile:user_profiles(full_name, profile_photo_url)
        )
      `);

      if (jur.supervisor_level !== "senior") {
        const filters: string[] = [];
        const wards = jur.assigned_wards as string[];
        const depts = jur.assigned_departments as string[];

        if (wards && wards.length > 0) {
          filters.push(`ward_id.in.(${wards.join(",")})`);
        }
        if (depts && depts.length > 0) {
          filters.push(`department_id.in.(${depts.join(",")})`);
        }
        
        if (filters.length > 0) {
          query = query.or(filters.join(","));
        } else {
          // Non-senior supervisor with no assignments sees no staff
          return [];
        }
      }

      const { data: staff, error: staffErr } = await query;
      
      if (staffErr) {
        console.error("[SupervisorAPI] Failed to fetch supervised staff:", staffErr);
        return [];
      }

      // 3. Dynamic Workload Calculation
      const staffIds = (staff || []).map((s) => s.user_id);
      
      const { data: activeCounts } = staffIds.length > 0 
        ? await client
            .from("complaints")
            .select("assigned_staff_id")
            .in("assigned_staff_id", staffIds)
            .in("status", ["assigned", "in_progress", "under_review", "reopened"])
        : { data: [] };

      const workloadMap: Record<string, number> = {};
      activeCounts?.forEach(c => {
        if (c.assigned_staff_id) {
          workloadMap[c.assigned_staff_id] = (workloadMap[c.assigned_staff_id] || 0) + 1;
        }
      });

      return (staff || []).map((s: any) => ({
        user_id: s.user_id as string,
        full_name: s.user?.profile?.full_name || "Staff Member",
        avatar_url: s.user?.profile?.profile_photo_url || undefined,
        role: s.staff_role as string,
        status: (s.availability_status as string) || "available",
        workload: workloadMap[s.user_id] || 0,
        performance_rating: (s.performance_rating as number) || 4.2,
        staff_code: s.staff_code as string || null,
        department_id: s.department_id as string || null,
        ward_id: s.ward_id as string || null,
        staff_role: s.staff_role as string,
        is_supervisor: s.is_supervisor || false,
        current_workload: workloadMap[s.user_id] || 0,
        max_concurrent_assignments: s.max_concurrent_assignments || 10,
        availability_status: (s.availability_status as any) || "available",
        last_known_location: s.last_known_location,
        last_active_at: s.last_active_at,
        is_active: s.is_active ?? true,
      }));
    } catch (err) {
      console.error("[SupervisorAPI] Error in getSupervisedStaff:", err);
      return [];
    }
  },

  async getStaffMetrics(client: SupabaseClient<Database>, supervisorId: string) {
    const staff = await this.getSupervisedStaff(client, supervisorId);
    return staff.map((s) => ({
      staffId: s.user_id,
      name: s.full_name,
      role: s.role || "field_agent",
      avatarUrl: s.avatar_url || undefined,
      totalResolved: Math.floor(Math.random() * 50), // Mock data
      slaCompliance: 85 + Math.floor(Math.random() * 15), // Mock
      rating: s.performance_rating || 4.5,
    }));
  },

  async getStaffAttendanceOverview(
    client: SupabaseClient<Database>,
    supervisorId: string
  ) {
    const staffList = await this.getSupervisedStaff(client, supervisorId);
    const staffIds = staffList.map((s) => s.user_id);
    if (staffIds.length === 0) return [];

    const today = new Date().toLocaleDateString("en-CA");

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

    if (error) return [];

    return staffList.map((staff) => {
      const log = (logs ?? []).find((l) => l.staff_id === staff.user_id);
      return {
        user_id: staff.user_id,
        full_name: staff.full_name,
        avatar_url: staff.avatar_url,
        role: staff.role || "Field Agent",
        computedStatus: log
          ? log.check_out_time
            ? "checked_out"
            : "on_duty"
          : "absent",
        attendance: log ?? null,
      };
    });
  },

  // ==========================================
  // 4. LEAVE MANAGEMENT
  // ==========================================
  async getPendingRequests(client: SupabaseClient<Database>, supervisorId: string) {
    const staff = await this.getSupervisedStaff(client, supervisorId);
    const staffIds = staff.map((s) => s.user_id);
    if (staffIds.length === 0) return [];

    const { data, error } = await client
      .from("leave_requests")
      .select(`
        *,
        requester:staff_profiles!leave_requests_staff_id_fkey(
          staff_code,
          user:users!inner(
            profile:user_profiles(full_name, profile_photo_url)
          )
        )
      `)
      .in("staff_id", staffIds)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) return [];
    return data;
  },

  async getLeaveHistory(client: SupabaseClient<Database>, supervisorId: string) {
    const staff = await this.getSupervisedStaff(client, supervisorId);
    const staffIds = staff.map((s) => s.user_id);
    if (staffIds.length === 0) return [];

    const { data, error } = await client
      .from("leave_requests")
      .select(`
        *,
        requester:staff_profiles!leave_requests_staff_id_fkey(
          staff_code,
          user:users!inner(
            profile:user_profiles(full_name, profile_photo_url)
          )
        )
      `)
      .in("staff_id", staffIds)
      .neq("status", "pending")
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error) return [];
    return data;
  },

  async processRequest(
    client: SupabaseClient<Database>,
    leaveId: string,
    supervisorId: string,
    status: "approved" | "rejected"
  ) {
    return this.updateLeaveStatus(client, leaveId, status, supervisorId);
  },

  async updateLeaveStatus(
    client: SupabaseClient<Database>,
    leaveId: string,
    status: "approved" | "rejected",
    supervisorId: string
  ) {
    const { error } = await client
      .from("leave_requests")
      .update({
        status,
        approved_by: supervisorId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", leaveId);

    if (error) throw error;
    return { success: true };
  },

  // ==========================================
  // 5. CHARTS & ACTIVITY
  // ==========================================
  async getStatusDistribution(
    client: SupabaseClient<Database>,
    supervisorId: string
  ) {
    const scope = await this.getJurisdiction(client, supervisorId);
    let query = client.from("complaints").select("status");

    if (!scope.is_senior) {
      const filters: string[] = [];
      if (scope.wards.length > 0)
        filters.push(`ward_id.in.(${scope.wards.join(",")})`);
      if (scope.depts.length > 0)
        filters.push(`assigned_department_id.in.(${scope.depts.join(",")})`);
      if (filters.length === 0) return [];
      query = query.or(filters.join(","));
    }

    const { data } = await query;
    if (!data) return [];

    const counts = { open: 0, in_progress: 0, resolved: 0, closed: 0 };

    data.forEach((c) => {
      const s = (c.status as string || "").toLowerCase();
      if (s === "received" || s === "pending") {
        counts.open++;
      } else if (
        ["assigned", "in_progress", "under_review", "reopened"].includes(s)
      ) {
        counts.in_progress++;
      } else if (s === "resolved") {
        counts.resolved++;
      } else if (s === "closed") {
        counts.closed++;
      }
    });

    return [
      { name: "Open",        value: counts.open,        fill: "#3B82F6" },
      { name: "In Progress", value: counts.in_progress, fill: "#F59E0B" },
      { name: "Resolved",    value: counts.resolved,    fill: "#10B981" },
      { name: "Closed",      value: counts.closed,      fill: "#6B7280" },
    ].filter((item) => item.value > 0);
  },

  async getTrendData(client: SupabaseClient<Database>, supervisorId: string) {
    const scope = await this.getJurisdiction(client, supervisorId);
    const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

    let receivedQuery = client
      .from("complaints")
      .select("submitted_at, created_at")
      .or(`submitted_at.gte.${thirtyDaysAgo},created_at.gte.${thirtyDaysAgo}`);

    let resolvedQuery = client
      .from("complaints")
      .select("resolved_at")
      .gte("resolved_at", thirtyDaysAgo)
      .not("resolved_at", "is", null);

    if (!scope.is_senior) {
      const filters: string[] = [];
      if (scope.wards.length > 0)
        filters.push(`ward_id.in.(${scope.wards.join(",")})`);
      if (scope.depts.length > 0)
        filters.push(`assigned_department_id.in.(${scope.depts.join(",")})`);

      if (filters.length > 0) {
        receivedQuery = receivedQuery.or(filters.join(","));
        resolvedQuery = resolvedQuery.or(filters.join(","));
      } else {
        // Fallback for non-senior without assignments
        return [];
      }
    }

    // Parallel Data Fetching
    const [receivedRes, resolvedRes] = await Promise.all([
      receivedQuery,
      resolvedQuery,
    ]);

    const receivedData = receivedRes.data;
    const resolvedData = resolvedRes.data;

    // Build a map pre-populated with the last 30 days
    const trendMap = new Map<string, { total: number; resolved: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = subDays(new Date(), i);
      trendMap.set(format(d, "MMM dd"), { total: 0, resolved: 0 });
    }

    // FIX: was `trendMap.get(day).total++` inside a broken .map() call
    receivedData?.forEach((c: any) => {
      const dateStr = c.submitted_at || c.created_at;
      if (!dateStr) return;
      const day = format(new Date(dateStr), "MMM dd");
      const entry = trendMap.get(day);
      if (entry) entry.total++;
    });

    resolvedData?.forEach((c: any) => {
      const day = format(new Date(c.resolved_at), "MMM dd");
      const entry = trendMap.get(day);
      if (entry) entry.resolved++;
    });

    return Array.from(trendMap.entries()).map(([date, counts]) => ({
      date,
      total: counts.total,
      resolved: counts.resolved,
    }));
  },

  async getRecentActivity(
    client: SupabaseClient<Database>,
    supervisorId: string
  ) {
    const scope = await this.getJurisdiction(client, supervisorId);

    let query = client
      .from("complaint_status_history")
      .select(`
        id, created_at, new_status,
        complaint:complaints(id, tracking_code, ward_id, assigned_department_id),
        actor:users!changed_by(profile:user_profiles(full_name))
      `)
      .order("created_at", { ascending: false })
      .limit(10);

    let recentComplaintsQuery = client
      .from("complaints")
      .select(`
         id, created_at, tracking_code, status, ward_id, assigned_department_id,
         reporter:user_profiles(full_name)
      `)
      .order("created_at", { ascending: false })
      .limit(15);
      
    // Parallel Data Fetching
    const [historyRes, recentComplaintsRes] = await Promise.all([
      query,
      recentComplaintsQuery,
    ]);

    const statusHistory = historyRes.data;
    const rawRecent = recentComplaintsRes.data;
    
    const filteredHistory = scope.is_senior 
      ? (statusHistory || [])
      : (statusHistory || []).filter((log: any) => {
          if (!log.complaint) return false;
          const matchesWard = scope.wards.length > 0 && scope.wards.includes(log.complaint.ward_id);
          const matchesDept = scope.depts.length > 0 && scope.depts.includes(log.complaint.assigned_department_id);
          return matchesWard || matchesDept;
        });

    const filteredRecent = scope.is_senior
      ? (rawRecent || [])
      : (rawRecent || []).filter((c: any) => {
          const matchesWard = scope.wards.length > 0 && scope.wards.includes(c.ward_id);
          const matchesDept = scope.depts.length > 0 && scope.depts.includes(c.assigned_department_id);
          return matchesWard || matchesDept;
        });

    const activities: any[] = [];

    (filteredHistory).forEach((log: any) => {
      activities.push({
        id: log.id,
        type: "status_change",
        description: `${log.actor?.profile?.full_name ?? "System"} updated ${log.complaint?.tracking_code ?? "Unknown"} to ${log.new_status}`,
        timestamp: log.created_at,
        link: log.complaint ? `/supervisor/complaints/${log.complaint.id}` : "#",
      });
    });

    (filteredRecent).forEach((c: any) => {
      activities.push({
        id: c.id,
        type: "new_report",
        description: `New report ${c.tracking_code} received from ${c.reporter?.full_name ?? "Citizen"}`,
        timestamp: c.created_at,
        link: `/supervisor/complaints/${c.id}`,
      });
    });

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  },

  async getWardHeatmapData(client: SupabaseClient<Database>) {
    const { data, error } = await client
      .from("complaints")
      .select("ward_id, status, sla_due_at")
      .not("ward_id", "is", null);

    if (error) return [];

    const { data: wards } = await client
      .from("wards")
      .select("id, ward_number");

    const wardMap = new Map<string, number>(
      (wards ?? []).map((w) => [w.id, w.ward_number])
    );

    const stats: Record<
      number,
      { ward_number: number; total_complaints: number; overdue_complaints: number }
    > = {};

    const now = Date.now();

    data.forEach((c: any) => {
      const wardNum = wardMap.get(c.ward_id as string);
      if (wardNum === undefined) return;

      if (!stats[wardNum]) {
        stats[wardNum] = {
          ward_number: wardNum,
          total_complaints: 0,
          overdue_complaints: 0,
        };
      }

      stats[wardNum].total_complaints++;

      // FIX: "overdue" is not a valid DB status. Derive overdue from sla_due_at
      // and whether the complaint is still in an open/active state.
      const isActiveStatus = OVERDUE_STATUSES.includes(
        c.status as ComplaintStatus
      );
      const isPastDue =
        c.sla_due_at != null && new Date(c.sla_due_at).getTime() < now;

      if (isActiveStatus && isPastDue) {
        stats[wardNum].overdue_complaints++;
      }
    });

    return Object.values(stats);
  },

  async getCategoryBreakdown(client: SupabaseClient<Database>, supervisorId?: string) {
    let query = client
      .from("complaints")
      .select("category:complaint_categories(name)");

    if (supervisorId) {
      const scope = await this.getJurisdiction(client, supervisorId);
      if (!scope.is_senior) {
        const filters: string[] = [];
        if (scope.wards.length > 0)
          filters.push(`ward_id.in.(${scope.wards.join(",")})`);
        if (scope.depts.length > 0)
          filters.push(`assigned_department_id.in.(${scope.depts.join(",")})`);

        if (filters.length > 0) {
          query = query.or(filters.join(","));
        } else {
          return [];
        }
      }
    }

    const { data, error } = await query;
    if (error) return [];

    const counts: Record<string, number> = {};
    data.forEach((c: any) => {
      const name = (c.category?.name as string) || "Other";
      counts[name] = (counts[name] ?? 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  },
};