// features/complaints/hooks/useComplaintManagement.ts

"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { complaintsApi, Complaint, ComplaintStatus, ComplaintPriority } from "../index";
import { toast } from "sonner";

export interface AdminComplaintFilters {
  search: string;
  status: ComplaintStatus[];
  priority: ComplaintPriority[];
  ward_id: string | null;
  category_id: string | null;
  date_range: { from: Date | null; to: Date | null };
}

export function useComplaintManagement() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  
  const [filters, setFilters] = useState<AdminComplaintFilters>({
    search: "",
    status: [],   
    priority: [], 
    ward_id: null,
    category_id: null,
    date_range: { from: null, to: null }
  });

  // FIX: Memoize the client so it doesn't trigger endless re-renders
  const supabase = useMemo(() => createClient(), []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const apiFilters = {
        search: filters.search,
        status: filters.status,
        priority: filters.priority,
        ward_id: filters.ward_id || undefined,
        category_id: filters.category_id || undefined,
        dateRange: {
            from: filters.date_range.from || undefined,
            to: filters.date_range.to || undefined
        },
        page,
        pageSize: 20
      };

      const result = await complaintsApi.searchComplaints(supabase, apiFilters);
      
      setComplaints(result.data || []);
      setTotalCount(result.total || 0);
    } catch (error: any) {
      console.error("Fetch Complaints Error:", error);
      toast.error("Failed to load complaints");
      setComplaints([]); 
    } finally {
      setLoading(false);
    }
  }, [filters, page, supabase]); 

  // --- Initial Fetch ---
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Actions ---
  const handleBulkStatusUpdate = async (ids: string[], status: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      await complaintsApi.bulkUpdateStatus(supabase, ids, status, user.id);
      toast.success(`Updated ${ids.length} complaints`);
      // Refresh the table
      fetchData(); 
    } catch (error) {
      console.error(error);
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