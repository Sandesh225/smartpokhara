"use client";

import { useState, useEffect, useCallback } from "react";
import { supervisorComplaintsQueries } from "@/lib/supabase/queries/supervisor-complaints";
import { ComplaintsFilters } from "@/components/supervisor/complaints/ComplaintsFilters";
import { ComplaintsTableView } from "@/components/supervisor/complaints/ComplaintsTableView";
import { BulkActionsBar } from "@/components/supervisor/complaints/BulkActionsBar";
import { createClient } from "@/lib/supabase/client"; // Browser client
import { toast } from "sonner";

export default function ComplaintsPage() {
  const [loading, setLoading] = useState(true);
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
  const [userId, setUserId] = useState<string>("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const [wardsRes, catsRes] = await Promise.all([
        supabase.from("wards").select("id, name"),
        supabase.from("complaint_categories").select("id, name"),
      ]);

      if (wardsRes.data) setWards(wardsRes.data);
      if (catsRes.data) setCategories(catsRes.data);

      // PASS THE CLIENT HERE
      const { data } =
        await supervisorComplaintsQueries.getJurisdictionComplaints(
          supabase, // <-- Pass the browser client
          user.id,
          filters
        );
      setComplaints(data || []);
    } catch (error) {
      toast.error("Failed to load complaints");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ... (Rest of the component remains the same, subscriptions work fine)

  const handleSelect = (id: string, selected: boolean) => {
    if (selected) setSelectedIds((prev) => [...prev, id]);
    else setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedIds(selected ? complaints.map((c) => c.id) : []);
  };

  const handleBulkAssign = async () => {
    const supabase = createClient();
    // Assuming bulk assign is implemented to take a client too, or uses internal logic
    // For now, let's keep the toast
    toast.info(`Assigning ${selectedIds.length} complaints...`);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
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

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1">
          <ComplaintsTableView
            complaints={complaints}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            isLoading={loading}
          />
        </div>
      </div>

      <BulkActionsBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onAssign={handleBulkAssign}
        onPrioritize={() => toast.info("Bulk Prioritize clicked")}
        onEscalate={() => toast.info("Bulk Escalate clicked")}
        onResolve={() => toast.info("Bulk Resolve clicked")}
      />
    </div>
  );
}
