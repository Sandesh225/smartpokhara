import type { SupabaseClient } from "@supabase/supabase-js";
import {
  calculateSLACompliance,
  calculateResolutionTime,
} from "@/lib/utils/performance-helpers";

export const supervisorAnalyticsQueries = {
  /**
   * Helper: Builds the PostgREST filter string based on Respected IDs.
   * Handles empty jurisdictions and senior admin overrides.
   * Refactored to prevent crashes if RPC returns empty or fails.
   */
  async getJurisdictionFilter(client: SupabaseClient, supervisorId: string) {
    try {
      // Use the RPC to get the supervisor's assigned wards and departments
      const { data: scopeData, error } = await client.rpc(
        "get_supervisor_jurisdiction"
      );

      // If error or no data (e.g., user is not a supervisor yet), limit to direct assignments
      if (error || !scopeData || scopeData.length === 0) {
        return `assigned_staff_id.eq.${supervisorId}`;
      }

      const scope = scopeData[0];
      // Senior supervisors see everything, so no filter is needed
      if (scope.is_senior) return null;

      const parts = [];
      if (scope.assigned_wards && scope.assigned_wards.length > 0) {
        parts.push(`ward_id.in.(${scope.assigned_wards.join(",")})`);
      }
      if (scope.assigned_departments && scope.assigned_departments.length > 0) {
        parts.push(
          `assigned_department_id.in.(${scope.assigned_departments.join(",")})`
        );
      }

      // Always include items directly assigned to the supervisor to ensure they can work on them
      parts.push(`assigned_staff_id.eq.${supervisorId}`);

      return parts.length > 0
        ? parts.join(",")
        : `assigned_staff_id.eq.${supervisorId}`;
    } catch (e) {
      console.error("Critical error building jurisdiction filter:", e);
      return `assigned_staff_id.eq.${supervisorId}`;
    }
  },

  /**
   * 1. Operational Dashboard Metrics
   * Scoped strictly to the supervisor's respected departments/wards.
   */
  async getComplaintMetrics(client: SupabaseClient, supervisorId: string) {
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
            .in("status", [
              "received",
              "assigned",
              "in_progress",
              "under_review",
            ])
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
        client
          .from("complaints")
          .select("submitted_at, resolved_at, sla_due_at")
          .eq("status", "resolved")
          .or(filter || `assigned_staff_id.eq.${supervisorId}`)
          .limit(100),
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
  },

  /**
   * 2. Status Distribution (Pie Chart)
   */
  async getStatusDistribution(client: SupabaseClient, supervisorId: string) {
    const filter = await this.getJurisdictionFilter(client, supervisorId);
    let query = client.from("complaints").select("status");
    if (filter) query = query.or(filter);

    const { data } = await query;
    const counts = { open: 0, in_progress: 0, resolved: 0, closed: 0 };

    data?.forEach((c: any) => {
      if (["received"].includes(c.status)) counts.open++;
      else if (
        ["assigned", "in_progress", "under_review", "reopened"].includes(
          c.status
        )
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
  },

  /**
   * 3. Category Breakdown (Bar Chart)
   */
  async getCategoryBreakdown(client: SupabaseClient, supervisorId: string) {
    const filter = await this.getJurisdictionFilter(client, supervisorId);
    let query = client
      .from("complaints")
      .select("category:complaint_categories(name)");
    if (filter) query = query.or(filter);

    const { data } = await query;
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
   * 4. 30-Day Trend
   */
  async getTrendData(client: SupabaseClient, supervisorId: string, days = 30) {
    const filter = await this.getJurisdictionFilter(client, supervisorId);
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    let query = client
      .from("complaints")
      .select("submitted_at, status")
      .gte("submitted_at", dateLimit.toISOString());
    if (filter) query = query.or(filter);

    const { data } = await query;
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

    data?.forEach((c: any) => {
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
  },

  /**
   * 5. Scoped Recent Activity
   * Uses inner join on complaints to enforce jurisdiction filtering at the database level.
   */
  async getRecentActivity(
    client: SupabaseClient,
    supervisorId: string,
    limit = 10
  ) {
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

    // Apply the jurisdiction filter to the joined 'complaints' table
    if (filter) {
      query = query.or(filter, { foreignTable: "complaints" });
    }

    const { data } = await query;

    return (
      data?.map((log: any) => ({
        id: log.id,
        description: `${log.actor?.profile?.full_name || "System"} updated ${
          log.complaint?.tracking_code
        } to ${log.new_status}`,
        timestamp: log.created_at,
        link: `/supervisor/complaints/${log.complaint?.id}`,
        type: log.new_status,
      })) || []
    );
  },
};
