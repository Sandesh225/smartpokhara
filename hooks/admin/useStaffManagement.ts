"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminStaffQueries } from "@/lib/supabase/queries/admin/staff";
import {
  AdminStaffListItem,
  StaffFiltersState,
  CreateStaffInput,
} from "@/types/admin-staff";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

/**
 * Hook to manage staff data with role-based scoping and real-time updates.
 * @param currentUser - The currently logged-in user profile (includes role and dept/ward info)
 */
export function useStaffManagement(currentUser: any) {
  const router = useRouter();
  const supabase = createClient();

  const [staffList, setStaffList] = useState<AdminStaffListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Initialize filters.
  // If the user is a Dept Head or Ward Staff, we hard-code the IDs to prevent viewing other scopes.
  const [filters, setFilters] = useState<StaffFiltersState>(() => ({
    search: "",
    role: "all",
    status: "active",
    department_id:
      currentUser?.staff_role === "dept_head"
        ? currentUser.department_id
        : null,
    ward_id:
      currentUser?.staff_role === "ward_staff" ? currentUser.ward_id : null,
  }));

  // 2. Fetch Data (Memoized to prevent infinite loops)
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminStaffQueries.getAllStaff(supabase, filters);

      // Secondary client-side search for ultra-responsive UI
      let processedData = data;
      if (filters.search) {
        const term = filters.search.toLowerCase();
        processedData = data.filter(
          (s) =>
            s.full_name?.toLowerCase().includes(term) ||
            s.email?.toLowerCase().includes(term) ||
            s.staff_code?.toLowerCase().includes(term)
        );
      }
      setStaffList(processedData);
    } catch (error: any) {
      console.error("Fetch Staff Error:", error);
      toast.error("Failed to load staff directory");
    } finally {
      setLoading(false);
    }
  }, [filters, supabase]);

  // 3. Realtime Subscription
  // Listens for any changes in the staff_profiles table and refreshes the list
  useEffect(() => {
    const channel = supabase
      .channel("staff-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "staff_profiles" },
        () => {
          fetchStaff(); // Refresh whenever a record is created/updated/deleted
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchStaff]);

  // 4. Initial fetch and fetch on filter change
  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // 5. Action: Create Staff
  const createStaff = async (input: CreateStaffInput) => {
    try {
      const result = await adminStaffQueries.createStaff(supabase, input);

      if (result.requires_invitation) {
        toast.info("User needs to sign up first", {
          description: `Email ${input.email} is not in the system. They must register as a citizen first.`,
        });
        return result;
      }

      toast.success("Staff member registered successfully");
      router.push("/admin/staff");
      return result;
    } catch (error: any) {
      toast.error(error.message || "Failed to create staff");
      throw error;
    }
  };

  // 6. Action: Deactivate Staff
  const deactivateStaff = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this staff member?"))
      return;

    try {
      await adminStaffQueries.updateStaff(supabase, id, { is_active: false });
      toast.success("Staff member deactivated");
      // fetchStaff() is triggered automatically by the Realtime subscription
    } catch (e: any) {
      toast.error(e.message || "Deactivation failed");
    }
  };

  return {
    staffList,
    loading,
    filters,
    setFilters,
    refresh: fetchStaff,
    createStaff,
    deactivateStaff,
  };
}