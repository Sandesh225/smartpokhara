import type { SupabaseClient } from "@supabase/supabase-js";
import { supervisorStaffQueries } from "./supervisor-staff";
import { calculateSLACompliance, calculateResolutionTime } from "@/lib/utils/performance-helpers";

export const supervisorAnalyticsQueries = {
  /**
   * 1. High-level Dashboard Metrics (Operational)
   * Used for the main Supervisor Dashboard
   */
  async getComplaintMetrics(client: SupabaseClient, supervisorId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [active, unassigned, overdue, resolvedToday, resolvedRecent] = await Promise.all([
      client.from("complaints").select("*", { count: "exact", head: true }).in("status", ["received", "assigned", "in_progress"]),
      client.from("complaints").select("*", { count: "exact", head: true }).is("assigned_staff_id", null).eq("status", "received"),
      client.from("complaints").select("*", { count: "exact", head: true }).lt("sla_due_at", new Date().toISOString()).not("status", "in", '("resolved","closed")'),
      client.from("complaints").select("*", { count: "exact", head: true }).eq("status", "resolved").gte("resolved_at", today.toISOString()),
      client.from("complaints").select("submitted_at, resolved_at, sla_due_at").eq("status", "resolved").limit(100)
    ]);

    const resolvedComplaints = resolvedRecent.data || [];
    const onTimeCount = resolvedComplaints.filter(c => new Date(c.resolved_at) <= new Date(c.sla_due_at)).length;
    const slaComplianceRate = calculateSLACompliance(resolvedComplaints.length, onTimeCount);
    
    let avgResolutionTimeHours = 0;
    if (resolvedComplaints.length > 0) {
      const totalTime = resolvedComplaints.reduce((acc, curr) => acc + (new Date(curr.resolved_at).getTime() - new Date(curr.submitted_at).getTime()), 0);
      avgResolutionTimeHours = Math.round((totalTime / resolvedComplaints.length) / (1000 * 60 * 60));
    }

    return {
      activeCount: active.count || 0,
      unassignedCount: unassigned.count || 0,
      overdueCount: overdue.count || 0,
      resolvedTodayCount: resolvedToday.count || 0,
      avgResolutionTimeHours,
      slaComplianceRate
    };
  },

  /**
   * 2. Aggregated Analytics (Analytical)
   * Used for the Analytics Overview Page.
   */
  async getAggregatedMetrics(client: SupabaseClient) {
     const { data: complaints } = await client
        .from("complaints")
        .select("submitted_at, resolved_at, sla_due_at, status");
        
     const total = complaints?.length || 0;
     const resolved = complaints?.filter(c => c.status === 'resolved' || c.status === 'closed') || [];
     const resolvedCount = resolved.length;
     
     const resolutionRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;
     
     // SLA Calculation
     const onTime = resolved.filter(c => new Date(c.resolved_at) <= new Date(c.sla_due_at)).length;
     const slaCompliance = calculateSLACompliance(resolvedCount, onTime);

     // Avg Time Calculation
     const avgTime = calculateResolutionTime(resolved as any);

     return {
        totalComplaints: total,
        resolutionRate,
        avgResolutionTime: avgTime,
        slaCompliance,
        citizenSatisfaction: 4.2 // Placeholder until feedback table is populated
     };
  },

  /**
   * 3. Status Distribution (Pie Chart)
   */
  async getStatusDistribution(client: SupabaseClient) {
    const { data } = await client.from("complaints").select("status");
    
    const counts = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
    data?.forEach((c: any) => {
      if (['received'].includes(c.status)) counts.open++;
      else if (['assigned', 'in_progress'].includes(c.status)) counts.in_progress++;
      else if (c.status === 'resolved') counts.resolved++;
      else if (c.status === 'closed') counts.closed++;
    });

    return [
      { name: "Open", value: counts.open, fill: "#3B82F6" },
      { name: "In Progress", value: counts.in_progress, fill: "#F59E0B" },
      { name: "Resolved", value: counts.resolved, fill: "#10B981" },
      { name: "Closed", value: counts.closed, fill: "#6B7280" }
    ];
  },

  /**
   * 4. Category Breakdown (Bar Chart)
   */
  async getCategoryBreakdown(client: SupabaseClient) {
    const { data } = await client.from("complaints").select("category:complaint_categories(name)");
    
    const counts: Record<string, number> = {};
    data?.forEach((item: any) => {
      const name = item.category?.name || "Uncategorized";
      counts[name] = (counts[name] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, fill: "#6366f1" }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  },

  /**
   * 5. 30-Day Trend (Line Chart)
   * Renamed from getComplaintTrendData to match page usage.
   */
  async getTrendData(client: SupabaseClient, supervisorId: string, days = 30) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    const { data } = await client
      .from("complaints")
      .select("submitted_at, status")
      .gte("submitted_at", date.toISOString());

    const trendMap: Record<string, { total: number; resolved: number }> = {};
    
    // Initialize map
    for(let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        trendMap[d.toLocaleDateString("en-US", { month: 'short', day: 'numeric' })] = { total: 0, resolved: 0 };
    }

    data?.forEach((c: any) => {
      const day = new Date(c.submitted_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
      if (trendMap[day]) {
        trendMap[day].total++;
        if (c.status === 'resolved' || c.status === 'closed') {
            trendMap[day].resolved++;
        }
      }
    });

    return Object.entries(trendMap)
        .reverse()
        .map(([date, counts]) => ({ 
            date, 
            count: counts.total, // For basic line chart
            total: counts.total,
            resolved: counts.resolved 
        }));
  },

  /**
   * 6. Ward Heatmap Data (Grid)
   */
  async getWardHeatmapData(client: SupabaseClient) {
    const { data } = await client.from("complaints").select("ward_id, ward:wards(ward_number), sla_due_at, status");
    
    const wardStats: Record<number, { total: number, overdue: number }> = {};

    data?.forEach((c: any) => {
        const num = c.ward?.ward_number;
        if (!num) return;
        
        if (!wardStats[num]) wardStats[num] = { total: 0, overdue: 0 };
        
        wardStats[num].total++;
        const isOverdue = new Date(c.sla_due_at) < new Date() && !['resolved', 'closed'].includes(c.status);
        if (isOverdue) wardStats[num].overdue++;
    });

    return Object.entries(wardStats).map(([wardStr, stats]) => ({
        ward_number: parseInt(wardStr),
        total_complaints: stats.total,
        overdue_complaints: stats.overdue
    }));
  },

  /**
   * 7. Staff Performance (Chart)
   */
  async getStaffMetrics(client: SupabaseClient, supervisorId: string) {
    const staffList = await supervisorStaffQueries.getSupervisedStaff(client, supervisorId);
    const staffIds = staffList.map(s => s.user_id);

    if (staffIds.length === 0) return [];

    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30)).toISOString();

    const [resolved, feedback] = await Promise.all([
      client.from("complaints")
        .select("assigned_staff_id, submitted_at, resolved_at, sla_due_at")
        .in("assigned_staff_id", staffIds)
        .eq("status", "resolved")
        .gte("resolved_at", thirtyDaysAgo),
      
      client.from("complaint_feedback")
        .select("complaint:complaints(assigned_staff_id), rating")
        .gte("created_at", thirtyDaysAgo)
    ]);

    return staffList.map(staff => {
      const staffResolved = resolved.data?.filter(r => r.assigned_staff_id === staff.user_id) || [];
      const staffFeedback = feedback.data?.filter((f: any) => f.complaint?.assigned_staff_id === staff.user_id) || [];

      const totalResolved = staffResolved.length;
      const onTimeCount = staffResolved.filter(r => new Date(r.resolved_at) <= new Date(r.sla_due_at)).length;
      const slaCompliance = calculateSLACompliance(totalResolved, onTimeCount);
      const avgTime = calculateResolutionTime(staffResolved as any);

      const avgRating = staffFeedback.length 
        ? staffFeedback.reduce((acc, curr) => acc + (curr.rating || 0), 0) / staffFeedback.length 
        : 0;

      return {
        staffId: staff.user_id,
        name: staff.full_name,
        avatarUrl: staff.avatar_url,
        role: staff.role,
        totalResolved,
        slaCompliance,
        avgResolutionHours: avgTime,
        rating: avgRating
      };
    });
  },

  // Helper for recent activity feed
  async getRecentActivity(client: SupabaseClient, limit = 10) {
    const { data } = await client
      .from("complaint_updates")
      .select(`
        id, update_type, created_at,
        complaint:complaints(id, tracking_code, title),
        actor:users!complaint_updates_created_by_fkey(profile:user_profiles(full_name))
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    return data?.map((log: any) => ({
      id: log.id,
      description: `${log.actor?.profile?.full_name || 'System'} ${log.update_type.replace('_', ' ')} on ${log.complaint?.tracking_code}`,
      timestamp: log.created_at,
      link: `/supervisor/complaints/${log.complaint?.id}`,
      type: log.update_type
    })) || [];
  }
};