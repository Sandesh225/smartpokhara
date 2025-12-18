"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminDashboardQueries } from "@/lib/supabase/queries/admin/dashboard";
import { AdminDashboardData } from "@/types/admin";
import { toast } from "sonner";

export function useAdminDashboard(initialData?: AdminDashboardData) {
  const [data, setData] = useState<AdminDashboardData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [trendRange, setTrendRange] = useState<'day' | 'week' | 'month'>('week');
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    try {
      const dashboardData = await adminDashboardQueries.getFullDashboard(supabase, trendRange);
      setData(dashboardData);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error("Failed to update dashboard data");
    } finally {
      setLoading(false);
    }
  }, [supabase, trendRange]);

  // Initial Fetch if no server data
  useEffect(() => {
    if (!initialData) fetchData();
  }, [fetchData, initialData]);

  // Re-fetch on filter change
  useEffect(() => {
    fetchData();
  }, [trendRange]);

  // Real-time Subscriptions
  useEffect(() => {
    const channels = [
      supabase.channel('admin-dashboard-complaints')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => fetchData()),
      
      supabase.channel('admin-dashboard-tasks')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_work_assignments' }, () => fetchData()),
      
      supabase.channel('admin-dashboard-payments')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'payments' }, () => fetchData())
    ];

    channels.forEach(c => c.subscribe());

    return () => {
      channels.forEach(c => supabase.removeChannel(c));
    };
  }, [fetchData, supabase]);

  return {
    data,
    loading,
    trendRange,
    setTrendRange,
    refresh: fetchData
  };
}