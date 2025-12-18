"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminComplaintQueries } from "@/lib/supabase/queries/admin/complaints";
import { AdminComplaintListItem, ComplaintFiltersState } from "@/types/admin-complaints";
import { toast } from "sonner";

export function useComplaintManagement() {
  const [complaints, setComplaints] = useState<AdminComplaintListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  
  // Safe Default State
  const [filters, setFilters] = useState<ComplaintFiltersState>({
    search: "",
    status: [],   // Must be array
    priority: [], // Must be array
    ward_id: null,
    category_id: null,
    date_range: { from: null, to: null }
  });

  const supabase = createClient();

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, count } = await adminComplaintQueries.getAllComplaints(
        supabase, 
        filters, 
        page,
        20 
      );
      
      setComplaints(data || []);
      setTotalCount(count || 0);
    } catch (error: any) {
      console.error("Fetch Complaints Error:", error);
      toast.error("Failed to load complaints");
      setComplaints([]); 
    } finally {
      setLoading(false);
    }
  }, [supabase, filters, page]);

  // --- Initial Fetch ---
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Actions ---
  const handleBulkStatusUpdate = async (ids: string[], status: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      await adminComplaintQueries.bulkUpdateStatus(supabase, ids, status, user.id);
      toast.success(`Updated ${ids.length} complaints`);
      fetchData(); 
    } catch (error) {
      toast.error("Failed to update complaints");
    }
  };

  return {
    complaints,
    loading,
    totalCount,
    page,
    setPage,
    filters, 
    setFilters,
    refresh: fetchData,
    handleBulkStatusUpdate
  };
}