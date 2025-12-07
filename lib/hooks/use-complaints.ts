"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Complaint, StaffWorkload } from "@/lib/types/complaints";
import type { StaffMember } from "@/components/supervisor/assign-modal";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
export interface Department {
  id: string;
  name: string;
}

// -----------------------------------------------------------------------------
// 1. User & Auth Hook
// -----------------------------------------------------------------------------
export function useCurrentUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchUser() {
      try {
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (authUser) {
          // Fetch matching staff profile if any
          const { data: profile } = await supabase
            .from("staff_profiles")
            .select("*")
            .eq("user_id", authUser.id)
            .single();

          setUser({ ...authUser, ...profile });
        } else {
          setUser(null);
        }
      } catch (err: any) {
        console.error("useCurrentUser error:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [supabase]);

  return { user, loading, error };
}

// -----------------------------------------------------------------------------
// 2. Departments Hook
// -----------------------------------------------------------------------------
export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchDepts() {
      const { data, error } = await supabase
        .from("departments")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (error) {
        console.error("useDepartments error:", error);
        return;
      }

      if (data) setDepartments(data);
    }

    fetchDepts();
  }, [supabase]);

  return { departments };
}

// -----------------------------------------------------------------------------
// 3. Staff Queue Hook (for staff task list / team queue)
// -----------------------------------------------------------------------------
export function useStaffQueue(queueType: "my_tasks" | "team_queue" | "ward_queue") {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      let rpcName = "rpc_get_my_assigned_complaints";
      let params: Record<string, any> = {};

      if (queueType === "team_queue") {
        rpcName = "rpc_supervisor_get_complaints";
        // add filter params later if needed
      }
      // TODO: implement ward_queue mapping if you add a specific RPC

      const { data, error } = await supabase.rpc(rpcName, params);
      if (error) throw error;
      setComplaints((data as Complaint[]) || []);
    } catch (err) {
      console.error("useStaffQueue error:", err);
    } finally {
      setLoading(false);
    }
  }, [queueType, supabase]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  return { complaints, loading, refetch: fetchQueue };
}

// -----------------------------------------------------------------------------
// 4. Staff Workload Hook (for supervisor team overview)
// -----------------------------------------------------------------------------
export function useStaffWorkload() {
  const [workloads, setWorkloads] = useState<StaffWorkload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  const fetchWorkload = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("rpc_supervisor_get_team_staff");
      if (error) throw error;

      setWorkloads((data as StaffWorkload[]) || []);
    } catch (err: any) {
      console.error("useStaffWorkload error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchWorkload();
  }, [fetchWorkload]);

  return { workloads, loading, error, refetch: fetchWorkload };
}

// -----------------------------------------------------------------------------
// 5. Supervisor Workflow Hook (assignment logic + staff list)
// -----------------------------------------------------------------------------
export function useSupervisorWorkflow(departmentId: string | null) {
  const [availableStaff, setAvailableStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  // Fetch staff for dropdown
  useEffect(() => {
    async function fetchTeam() {
      if (!departmentId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase.rpc(
          "rpc_supervisor_get_team_staff"
        );

        if (error) throw error;

        const formatted: StaffMember[] = (data || []).map((s: any) => ({
          user_id: s.user_id,
          full_name: s.full_name,
          active_complaints_count: s.active_complaints_count || 0,
          is_available: s.is_available,
          avatar_url: s.avatar_url,
        }));

        setAvailableStaff(formatted);
      } catch (err) {
        console.error("useSupervisorWorkflow team fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTeam();
  }, [departmentId, supabase]);

  const handleAssign = async (
    complaintId: string,
    staffId: string,
    note?: string
  ) => {
    try {
      const { error } = await supabase.rpc(
        "rpc_supervisor_assign_complaint",
        {
          p_complaint_id: complaintId,
          p_staff_id: staffId,
          p_reason: note || null, // must match SQL param name
        }
      );

      if (error) throw error;

      toast({
        title: "Complaint Assigned",
        description: "Staff member has been notified.",
      });

      return true;
    } catch (err: any) {
      console.error("useSupervisorWorkflow assignment error:", err);
      toast({
        title: "Assignment Failed",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  return {
    availableStaff,
    loading,
    handleAssign,
  };
}

// -----------------------------------------------------------------------------
// 6. Notifications Hook (for staff)
// -----------------------------------------------------------------------------
export function useStaffNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("rpc_get_my_notifications", {
        p_limit: 20,
      });

      if (error) throw error;

      const list = data || [];
      setNotifications(list);
      setUnreadCount(list.filter((n: any) => !n.is_read).length);
    } catch (err) {
      console.error("useStaffNotifications error:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    await supabase.rpc("rpc_mark_notifications_read", {
      p_notification_ids: [id],
    });

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await supabase.rpc("rpc_mark_all_notifications_read");
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
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

// -----------------------------------------------------------------------------
// 7. Single Complaint Detail Hook
// -----------------------------------------------------------------------------
export function useComplaintDetail(id: string) {
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select(
          `
          *,
          ward:wards(ward_number, name),
          category:complaint_categories(name),
          assigned_staff:users!assigned_staff_id(
            user_profiles(full_name, phone)
          ),
          citizen:users!citizen_id(
            email,
            phone,
            user_profiles(full_name)
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      setComplaint(data);
    } catch (err: any) {
      console.error("useComplaintDetail error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id, supabase]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { complaint, loading, error, refetch: fetchDetail };
}

// -----------------------------------------------------------------------------
// 8. Staff Action Hooks (Accept / Reject / Resolve)
// -----------------------------------------------------------------------------
export function useAcceptComplaint() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  const acceptComplaint = async (id: string, _userId?: string, notes?: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc("rpc_staff_accept_complaint", {
        p_complaint_id: id,
      });

      if (error) throw error;

      toast({
        title: "Accepted",
        description: "Complaint moved to In Progress.",
      });
    } catch (err: any) {
      console.error("useAcceptComplaint error:", err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { acceptComplaint, loading };
}

export function useRejectComplaint() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  const rejectComplaint = async (id: string, _userId: string, reason: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc("rpc_staff_reject_complaint", {
        p_complaint_id: id,
        p_reason: reason,
      });

      if (error) throw error;

      toast({
        title: "Rejected",
        description: "Complaint returned to queue.",
      });
    } catch (err: any) {
      console.error("useRejectComplaint error:", err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { rejectComplaint, loading };
}

export function useResolveComplaint() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  const resolveComplaint = async (id: string, notes: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc("rpc_staff_resolve_complaint", {
        p_complaint_id: id,
        p_notes: notes,
        p_photos: [], // add photo URLs if needed
      });

      if (error) throw error;

      toast({
        title: "Resolved",
        description: "Sent for supervisor approval.",
      });
    } catch (err: any) {
      console.error("useResolveComplaint error:", err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { resolveComplaint, loading };
}

// -----------------------------------------------------------------------------
// 9. Dummy placeholders to keep API surface stable
// -----------------------------------------------------------------------------
export function useUpdateProgress() {
  return {
    updateProgress: async () => {},
    loading: false,
  };
}

export function useComplaintRealtimeUpdates(_id: string) {
  return {
    lastUpdate: null,
  };
}
