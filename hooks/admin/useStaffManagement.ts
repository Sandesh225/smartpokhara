"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminStaffQueries } from "@/lib/supabase/queries/admin/staff";
import { subscribeToStaffActivity } from "@/lib/supabase/realtime/admin/staff-activity";
import { AdminStaffListItem, StaffFiltersState, CreateStaffInput } from "@/types/admin-staff";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useStaffManagement() {
  const [staffList, setStaffList] = useState<AdminStaffListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<StaffFiltersState>({
    search: "",
    role: "all",
    department_id: null,
    ward_id: null,
    status: "active"
  });

  const supabase = createClient();
  const router = useRouter();

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminStaffQueries.getAllStaff(supabase, filters);
      
      let filtered = data;
      if (filters.search) {
        const term = filters.search.toLowerCase();
        filtered = data.filter(s => 
           s.full_name?.toLowerCase().includes(term) || 
           s.email?.toLowerCase().includes(term) ||
           s.staff_code?.toLowerCase().includes(term)
        );
      }
      
      setStaffList(filtered);
    } catch (error) {
      console.error("Fetch Staff Error:", error);
      toast.error("Failed to load staff list");
    } finally {
      setLoading(false);
    }
  }, [filters, supabase]);

  useEffect(() => {
    fetchStaff();
    const channel = subscribeToStaffActivity(supabase, fetchStaff);
    return () => { supabase.removeChannel(channel); };
  }, [fetchStaff, supabase]);

  const createStaff = async (input: CreateStaffInput) => {
    try {
        const result = await adminStaffQueries.createStaff(supabase, input);
        
        if (result.requires_invitation) {
            toast.info("User needs to sign up first", {
                description: `Email ${input.email} is not in the system yet.`
            });
        } else {
            toast.success("Staff member registered successfully");
            router.push("/admin/staff");
        }
    } catch (error: any) {
        console.error("Create Staff Error:", error);
        toast.error(error.message || "Failed to create staff");
    }
  };

  const deactivateStaff = async (id: string) => {
      if(!confirm("Are you sure you want to deactivate this staff member?")) return;
      try {
          await adminStaffQueries.updateStaff(supabase, id, { is_active: false });
          toast.success("Staff deactivated");
          fetchStaff();
      } catch(e) {
          toast.error("Action failed");
      }
  };

  return {
    staffList,
    loading,
    filters,
    setFilters,
    refresh: fetchStaff,
    createStaff,
    deactivateStaff
  };
}