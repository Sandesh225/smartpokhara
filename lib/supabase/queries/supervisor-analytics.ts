// ============================================================================
// FILE 1: lib/supabase/queries/supervisor-analytics.ts
// Complete fixed version with robust error handling
// ============================================================================

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  calculateSLACompliance,
  calculateResolutionTime,
} from "@/lib/utils/performance-helpers";

export const supervisorAnalyticsQueries = {
  /**
   * Helper: Get supervisor jurisdiction with safe fallbacks
   */
  async getJurisdiction(client: SupabaseClient) {
    try {
      const { data, error } = await client
        .rpc("get_supervisor_jurisdiction")
        .single();

      if (error || !data) {
        console.error("Jurisdiction error:", error);
        return {
          assigned_wards: [],
          assigned_departments: [],
          is_senior: false,
        };
      }

      return {
        assigned_wards: data.assigned_wards || [],
        assigned_departments: data.assigned_departments || [],
        is_senior: data.is_senior || false,
      };
    } catch (err) {
      console.error("Critical jurisdiction error:", err);
      return {
        assigned_wards: [],
        assigned_departments: [],
        is_senior: false,
      };
    }
  },

  /**
   * Helper: Build PostgREST filter string
   */
  async getJurisdictionFilter(client: SupabaseClient, supervisorId: string) {
    try {
      const scope = await this.getJurisdiction(client);

      // Senior supervisors see everything
      if (scope.is_senior) return null;

      const parts: string[] = [];

      if (scope.assigned_wards?.length > 0) {
        parts.push(`ward_id.in.(${scope.assigned_wards.join(",")}})`);
      }

      if (scope.assigned_departments?.length > 0) {
        parts.push(
          `assigned_department_id.in.(${scope.assigned_departments.join(",")})`
        );
      }

      // Always include directly assigned items
      parts.push(`assigned_staff_id.eq.${supervisorId}`);

      return parts.length > 0 ? parts.join(",") : `assigned_staff_id.eq.${supervisorId}`;
    } catch (e) {
      console.error("Filter building error:", e);
      return `assigned_staff_id.eq.${supervisorId}`;
    }
  },

  /**
   * 1. Dashboard Metrics with Safe Counts
   */
  async getComplaintMetrics(client: SupabaseClient, supervisorId: string) {
    try {
      const filter = await this.getJurisdictionFilter(client, supervisorId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const applyScope = (q: any) => (filter ? q.or(filter) : q);

      const [active, unassigned, overdue, resolvedToday, resolvedRecent] =
        await Promise.all([
          applyScope(
            client
              .from("complaints")
              .select("*", { count: "exact", head: true })
              .in("status", ["received", "assigned", "in_progress", "under_review"])
          ),
          applyScope(
            client
              .from("complaints")
              .select("*", { count: "exact", head: true })
              .is("assigned_staff_id", null)
              .not("status", "in", '("resolved","closed","rejected")')
          ),
          applyScope(
            client
              .from("complaints")
              .select("*", { count: "exact", head: true })
              .lt("sla_due_at", new Date().toISOString())
              .not("status", "in", '("resolved","closed")')
          ),
          applyScope(
            client
              .from("complaints")
              .select("*", { count: "exact", head: true })
              .eq("status", "resolved")
              .gte("resolved_at", today.toISOString())
          ),
          applyScope(
            client
              .from("complaints")
              .select("submitted_at, resolved_at, sla_due_at")
              .eq("status", "resolved")
              .limit(100)
          ),
        ]);

      const resolvedData = resolvedRecent.data || [];
      const onTime = resolvedData.filter(
        (c) =>
          c.resolved_at &&
          c.sla_due_at &&
          new Date(c.resolved_at) <= new Date(c.sla_due_at)
      ).length;

      return {
        activeCount: active.count || 0,
        unassignedCount: unassigned.count || 0,
        overdueCount: overdue.count || 0,
        resolvedTodayCount: resolvedToday.count || 0,
        avgResolutionTimeHours: calculateResolutionTime(resolvedData as any),
        slaComplianceRate: calculateSLACompliance(resolvedData.length, onTime),
      };
    } catch (err) {
      console.error("Metrics error:", err);
      return {
        activeCount: 0,
        unassignedCount: 0,
        overdueCount: 0,
        resolvedTodayCount: 0,
        avgResolutionTimeHours: 0,
        slaComplianceRate: 0,
      };
    }
  },

  /**
   * 2. Status Distribution (Pie Chart)
   */
  async getStatusDistribution(client: SupabaseClient, supervisorId: string) {
    try {
      const filter = await this.getJurisdictionFilter(client, supervisorId);
      let query = client.from("complaints").select("status");
      if (filter) query = query.or(filter);

      const { data, error } = await query;
      
      if (error) {
        console.error("Status distribution error:", error);
        return [];
      }

      const counts = { open: 0, in_progress: 0, resolved: 0, closed: 0 };

      (data || []).forEach((c: any) => {
        if (["received"].includes(c.status)) counts.open++;
        else if (
          ["assigned", "in_progress", "under_review", "reopened"].includes(c.status)
        )
          counts.in_progress++;
        else if (c.status === "resolved") counts.resolved++;
        else if (c.status === "closed") counts.closed++;
      });

      return [
        { name: "Open", value: counts.open, fill: "#3B82F6" },
        { name: "In Progress", value: counts.in_progress, fill: "#F59E0B" },
        { name: "Resolved", value: counts.resolved, fill: "#10B981" },
        { name: "Closed", value: counts.closed, fill: "#6B7280" },
      ];
    } catch (err) {
      console.error("Status distribution error:", err);
      return [];
    }
  },

  /**
   * 3. Category Breakdown (Bar Chart)
   */
  async getCategoryBreakdown(client: SupabaseClient, supervisorId: string) {
    try {
      const filter = await this.getJurisdictionFilter(client, supervisorId);
      let query = client
        .from("complaints")
        .select("category:complaint_categories(name)");
      if (filter) query = query.or(filter);

      const { data, error } = await query;
      
      if (error) {
        console.error("Category breakdown error:", error);
        return [];
      }

      const counts: Record<string, number> = {};
      (data || []).forEach((item: any) => {
        const name = item.category?.name || "Uncategorized";
        counts[name] = (counts[name] || 0) + 1;
      });

      return Object.entries(counts)
        .map(([name, value]) => ({ name, value, fill: "#6366f1" }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    } catch (err) {
      console.error("Category breakdown error:", err);
      return [];
    }
  },

  /**
   * 4. 30-Day Trend
   */
  async getTrendData(client: SupabaseClient, supervisorId: string, days = 30) {
    try {
      const filter = await this.getJurisdictionFilter(client, supervisorId);
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - days);

      let query = client
        .from("complaints")
        .select("submitted_at, status")
        .gte("submitted_at", dateLimit.toISOString());
      if (filter) query = query.or(filter);

      const { data, error } = await query;
      
      if (error) {
        console.error("Trend data error:", error);
        return [];
      }

      const trendMap: Record<string, { total: number; resolved: number }> = {};

      for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        trendMap[label] = { total: 0, resolved: 0 };
      }

      (data || []).forEach((c: any) => {
        const day = new Date(c.submitted_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        if (trendMap[day]) {
          trendMap[day].total++;
          if (["resolved", "closed"].includes(c.status)) trendMap[day].resolved++;
        }
      });

      return Object.entries(trendMap)
        .reverse()
        .map(([date, counts]) => ({
          date,
          count: counts.total,
          resolved: counts.resolved,
        }));
    } catch (err) {
      console.error("Trend data error:", err);
      return [];
    }
  },

  /**
   * 5. Recent Activity
   */
  async getRecentActivity(
    client: SupabaseClient,
    supervisorId: string,
    limit = 10
  ) {
    try {
      const filter = await this.getJurisdictionFilter(client, supervisorId);

      let query = client
        .from("complaint_status_history")
        .select(
          `
          id, created_at, new_status,
          complaint:complaints!inner(id, tracking_code, ward_id, assigned_department_id),
          actor:users!changed_by(profile:user_profiles(full_name))
        `
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      if (filter) {
        query = query.or(filter, { foreignTable: "complaints" });
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Recent activity error:", error);
        return [];
      }

      return (data || []).map((log: any) => ({
        id: log.id,
        description: `${log.actor?.profile?.full_name || "System"} updated ${
          log.complaint?.tracking_code || "complaint"
        } to ${log.new_status}`,
        timestamp: log.created_at,
        link: `/supervisor/complaints/${log.complaint?.id}`,
        type: log.new_status,
      }));
    } catch (err) {
      console.error("Recent activity error:", err);
      return [];
    }
  },
};