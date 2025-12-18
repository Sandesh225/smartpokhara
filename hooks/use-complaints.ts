"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Complaint,
  ComplaintFilters,
  ComplaintStatus,
  ComplaintPriority,
} from "@/lib/types/complaints";

// --- Hook: useComplaints (Main List) ---
export function useComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<ComplaintFilters>({});

  const supabase = createClient();

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      // Start building the query
      let query = supabase.from("complaints").select(
        `
          *,
          category:complaint_categories(id, name),
          ward:wards(id, ward_number, name),
          department:departments(id, name),
          assigned_staff:staff_profiles!complaints_assigned_staff_id_fkey(
            user_id, staff_code,
            user:users(profile:user_profiles(full_name, avatar_url))
          )
        `,
        { count: "exact" }
      );

      // Apply Filters
      if (filters.status && filters.status.length > 0) {
        query = query.in("status", filters.status);
      }
      if (filters.priority && filters.priority.length > 0) {
        query = query.in("priority", filters.priority);
      }
      if (filters.ward_id) {
        query = query.eq("ward_id", filters.ward_id);
      }
      if (filters.category_id) {
        query = query.eq("category_id", filters.category_id);
      }
      if (filters.dateRange?.from) {
        query = query.gte("submitted_at", filters.dateRange.from.toISOString());
      }
      if (filters.dateRange?.to) {
        query = query.lte("submitted_at", filters.dateRange.to.toISOString());
      }
      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,tracking_code.ilike.%${filters.search}%`
        );
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.order("submitted_at", { ascending: false }).range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform data to match frontend types if necessary, or just cast
      const formattedData: Complaint[] = (data || []).map((item: any) => ({
        ...item,
        category_name: item.category?.name,
        ward_number: item.ward?.ward_number,
        department_name: item.department?.name,
        assigned_staff_name:
          item.assigned_staff?.user?.profile?.full_name || "Unassigned",
      }));

      setComplaints(formattedData);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }, [supabase, page, pageSize, filters]);

  // Initial Fetch & Filter Changes
  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("complaints-list-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "complaints" },
        () => {
          fetchComplaints();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchComplaints]);

  return {
    complaints,
    loading,
    totalCount,
    page,
    setPage,
    pageSize,
    setPageSize,
    filters,
    setFilters,
    refresh: fetchComplaints,
  };
}

// --- Hook: useDepartments ---
export function useDepartments() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchDepartments() {
      const { data, error } = await supabase
        .from("departments")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");

      if (!error) {
        setDepartments(data || []);
      }
      setLoading(false);
    }
    fetchDepartments();
  }, [supabase]);

  return { departments, loading };
}

// --- Hook: useWards ---
export function useWards() {
  const [wards, setWards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchWards() {
      const { data, error } = await supabase
        .from("wards")
        .select("id, ward_number, name")
        .eq("is_active", true)
        .order("ward_number");

      if (!error) {
        setWards(data || []);
      }
      setLoading(false);
    }
    fetchWards();
  }, [supabase]);

  return { wards, loading };
}

// --- Hook: useCategories ---
export function useCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from("complaint_categories")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (!error) {
        setCategories(data || []);
      }
      setLoading(false);
    }
    fetchCategories();
  }, [supabase]);

  return { categories, loading };
}

// --- Hook: useStaffNotifications ---
export function useStaffNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchNotifications = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.is_read).length || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchNotifications();

    // Real-time subscription for notifications
    const channel = supabase
      .channel("staff-notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;

      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}

// --- Hook: useCurrentUser ---
export function useCurrentUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchUser() {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          setLoading(false);
          return;
        }

        // Fetch profile and roles
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", authUser.id)
          .single();

        // Fetch roles
        const { data: roles } = await supabase.rpc("fn_get_user_roles", {
          p_user_id: authUser.id,
        });

        // Fetch department/ward info if staff
        let department_name = "";
        let ward_number = "";

        // Check for staff profile
        const { data: staffProfile } = await supabase
          .from("staff_profiles")
          .select("department:departments(name), ward:wards(ward_number)")
          .eq("user_id", authUser.id)
          .single();

        if (staffProfile) {
          department_name = staffProfile.department?.name || "";
          ward_number = staffProfile.ward?.ward_number
            ? `Ward ${staffProfile.ward.ward_number}`
            : "";
        }

        setUser({
          ...authUser,
          ...profile,
          roles: roles?.map((r: any) => r.role_type) || [],
          department_name,
          ward_number,
        });
      } catch (error) {
        console.error("Error fetching current user:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [supabase]);

  return { user, loading };
}