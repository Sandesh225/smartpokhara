import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/database.types";
import { 
  AdminMetrics, 
  DashboardActivity, 
  DashboardTask, 
  DashboardTrend, 
  CitizenDashboardStats,
  AdminDashboardData,
  UserGrowth,
  DepartmentPerformance,
  WardAnalytics
} from "./types";

export const adminDashboardApi = {
  async getFullDashboard(client: SupabaseClient<Database>): Promise<AdminDashboardData> {
    const [metrics, recentComplaints, recentTasks, trends, deptWorkload, wardStats, statusDist] = await Promise.all([
      this.getAdminMetrics(client),
      this.getRecentActivity(client),
      this.getRecentTasks(client),
      this.getComplaintTrends(client, 'week'), // Default to 7 days
      this.getDepartmentPerformance(client),
      this.getWardAnalytics(client),
      this.getStatusDistribution(client) // Replacing the mock array!
    ]);

    return {
      metrics,
      recentComplaints,
      recentTasks,
      trends,
      deptWorkload,
      wardStats,
      statusDist,
      paymentStats: [], // Can be populated later if a dedicated RPC is added
      websiteAnalytics: [] 
    };
  },

  async getAdminMetrics(client: SupabaseClient<Database>) {
    const { data, error } = await client.rpc("rpc_admin_get_metrics");
    
    // Type Definition matches the RPC's camelCase output perfectly
    const metrics = data as { 
      totalComplaints: number; 
      resolvedComplaints: number; 
      revenue: number; 
      activeTasks: number 
    } | null;
    
    if (error || !metrics) {
      console.error("Failed to fetch admin metrics:", error);
      return {
        totalComplaints: 0,
        resolvedComplaints: 0,
        revenue: 0,
        activeTasks: 0
      } as AdminMetrics;
    }

    return {
      totalComplaints: metrics.totalComplaints || 0,
      resolvedComplaints: metrics.resolvedComplaints || 0,
      revenue: metrics.revenue || 0,
      activeTasks: metrics.activeTasks || 0,
    } as AdminMetrics;
  },

  async getStatusDistribution(client: SupabaseClient<Database>) {
    const { data, error } = await client.rpc("rpc_admin_get_status_dist");
    
    if (error) {
      console.error("Failed to fetch status distribution:", error);
      return [];
    }

    return (data as any[] || []).map(s => ({
      status: s.status,
      count: s.count || 0
    }));
  },

  async getRecentActivity(client: SupabaseClient<Database>, limit = 5) {
    const { data, error } = await client
      .from("complaints")
      .select(`
          id, title, status, priority, created_at,
          citizen:users!complaints_citizen_id_fkey(email)
      `)
      .order("created_at", { ascending: false })
      .limit(limit);
  
    if (error) {
        console.error("Failed to fetch recent activity:", error);
        return [];
    }
    return data as DashboardActivity[];
  },

  async getRecentTasks(client: SupabaseClient<Database>, limit = 5) {
    const { data, error } = await client
      .from("supervisor_tasks")
      .select("id, title, status, priority, due_date")
      .order("created_at", { ascending: false })
      .limit(limit);
      
    if (error) {
        console.error("Failed to fetch recent tasks:", error);
        return [];
    }
    return data as DashboardTask[];
  },

  async getComplaintTrends(client: SupabaseClient<Database>, range: 'day' | 'week' | 'month' = 'week'): Promise<DashboardTrend[]> {
    // Calling your RPC directly handles the zero-filling for empty days automatically!
    const { data, error } = await client.rpc("rpc_admin_get_trends", { p_range: range });
      
    if (error) {
        console.error("Failed to fetch trends:", error);
        return [];
    }

    return (data as any[] || []).map(t => ({
      date: t.date,
      count: t.count || 0
    }));
  },

  async getUserGrowth(client: SupabaseClient<Database>): Promise<UserGrowth[]> {
    const { data, error } = await client
      .from("users")
      .select("created_at");
      
    if (error) throw error;

    const growthMap = new Map<string, number>();
    (data || []).forEach(u => {
      const month = u.created_at.slice(0, 7); // YYYY-MM
      growthMap.set(month, (growthMap.get(month) || 0) + 1);
    });

    return Array.from(growthMap.entries()).map(([month, count]) => ({
      month,
      count
    })).sort((a,b) => a.month.localeCompare(b.month));
  },

  async getDepartmentPerformance(client: SupabaseClient<Database>): Promise<DepartmentPerformance[]> {
     // Stripped out Math.random() and replaced with your actual database RPC
     const { data, error } = await client.rpc("rpc_admin_get_dept_workload");
     
     if (error) {
        console.error("Failed to fetch department performance:", error);
        return [];
     }

     return (data as any[] || []).map(d => ({
       id: d.id,
       name: d.name,
       department_name: d.name, // Alias mapping
       active_count: d.active_count || 0,
       overdue_count: d.overdue_count || 0,
       // Defaults for metrics not currently provided by the RPC
       total_resolved: 0, 
       sla_compliance: 0 
     }));
  },

  async getWardAnalytics(client: SupabaseClient<Database>): Promise<WardAnalytics[]> {
    const { data, error } = await client.rpc("rpc_admin_get_ward_stats");
    
    if (error) {
      console.error("Failed to fetch ward analytics:", error);
      return []; 
    }

    return (data as any[] || []).map(w => ({
        ward_number: w.ward_number,
        complaint_count: w.complaint_count || 0,
        resolved_count: w.resolved_complaints || 0,
        revenue: w.revenue || 0 
    }));
  },

  async getCitizenDashboardStats(client: SupabaseClient<Database>): Promise<CitizenDashboardStats> {
    const { data, error } = await client.rpc("rpc_get_dashboard_stats");
    if (error) throw error;
    return data as unknown as CitizenDashboardStats;
  }
};