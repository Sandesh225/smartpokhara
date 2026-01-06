"use client";

import { useState, useEffect, useCallback } from "react";
import { supervisorComplaintsQueries } from "@/lib/supabase/queries/supervisor-complaints";
import { ComplaintsFilters } from "@/app/(protected)/supervisor/complaints/_components/ComplaintsFilters";
import { ComplaintsTableView } from "@/app/(protected)/supervisor/complaints/_components/ComplaintsTableView";
import { BulkActionsBar } from "@/app/(protected)/supervisor/complaints/_components/BulkActionsBar";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ComplaintsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [filters, setFilters] = useState({
    search: "",
    status: [] as string[],
    priority: [] as string[],
    ward_id: [] as string[],
    category: [] as string[],
  });

  const [wards, setWards] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return; // Middleware should handle redirect

      // 1. Fetch Metadata (Wards/Categories) if empty
      if (wards.length === 0) {
        const [wardsRes, catsRes] = await Promise.all([
          supabase.from("wards").select("id, name"),
          supabase.from("complaint_categories").select("id, name"),
        ]);
        if (wardsRes.data) setWards(wardsRes.data);
        if (catsRes.data) setCategories(catsRes.data);
      }

      // 2. Fetch Complaints
      const { data } =
        await supervisorComplaintsQueries.getJurisdictionComplaints(
          supabase,
          user.id,
          filters
        );

      setComplaints(data || []);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to load data");
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }, [filters, wards.length]); // Added dependency

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelect = (id: string, selected: boolean) => {
    if (selected) setSelectedIds((prev) => [...prev, id]);
    else setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedIds(selected ? complaints.map((c) => c.id) : []);
  };

  const handleBulkAssign = async () => {
    toast.info(`Assigning ${selectedIds.length} complaints...`);
    // Add implementation later
  };

  if (error) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Error Loading Complaints
          </h3>
          <p className="text-gray-500">{error}</p>
        </div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] gap-6 p-6">
      {/* Sidebar Filters */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <ComplaintsFilters
          filters={filters}
          onChange={(key, value) =>
            setFilters((prev) => ({ ...prev, [key]: value }))
          }
          onClear={() =>
            setFilters({
              search: "",
              status: [],
              priority: [],
              ward_id: [],
              category: [],
            })
          }
          wards={wards}
          categories={categories}
        />
      </div>

      {/* Main Table Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <ComplaintsTableView
            complaints={complaints}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            isLoading={false}
          />
        )}
      </div>

      {/* Floating Bulk Actions */}
      {selectedIds.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          onAssign={handleBulkAssign}
          onPrioritize={() => toast.info("Bulk Prioritize clicked")}
          onEscalate={() => toast.info("Bulk Escalate clicked")}
          onResolve={() => toast.info("Bulk Resolve clicked")}
        />
      )}
    </div>
  );
}