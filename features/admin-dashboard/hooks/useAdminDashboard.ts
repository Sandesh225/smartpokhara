"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminDashboardApi } from "../api";
import { AdminDashboardData } from "../types";
import { toast } from "sonner";

export function useAdminDashboard(initialData?: AdminDashboardData) {
  const [data, setData] = useState<AdminDashboardData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [trendRange, setTrendRange] = useState<'day' | 'week' | 'month'>('week');
  
  // 1. Memoize the Supabase client so it doesn't trigger re-renders
  const supabase = useMemo(() => createClient(), []);
  
  // Track if it's the first render to prevent double-fetching
  const isMounted = useRef(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // NOTE: You'll eventually want to pass trendRange to this API call
      const dashboardData = await adminDashboardApi.getFullDashboard(supabase);
      setData(dashboardData);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error("Failed to update dashboard data");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // 2. Handle both Initial Load (if no SSR data) AND trendRange changes safely
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      // Only fetch on mount if we didn't get SSR data
      if (!initialData) fetchData();
      return;
    }
    
    // This only runs on subsequent renders when trendRange changes
    fetchData();
  }, [trendRange, fetchData, initialData]);

  // 3. Stable Real-time Subscriptions
  useEffect(() => {
    const channel1 = supabase.channel('admin-dashboard-complaints')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => fetchData());
      
    const channel2 = supabase.channel('admin-dashboard-tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_work_assignments' }, () => fetchData());
      
    const channel3 = supabase.channel('admin-dashboard-payments')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'payments' }, () => fetchData());

    channel1.subscribe();
    channel2.subscribe();
    channel3.subscribe();

    return () => {
      supabase.removeChannel(channel1);
      supabase.removeChannel(channel2);
      supabase.removeChannel(channel3);
    };
  }, [fetchData, supabase]);

  return {
    data,
    isLoading: loading,
    trendRange,
    setTrendRange,
    refetch: fetchData
  };
}