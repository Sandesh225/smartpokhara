"use client";

import { useState, useEffect, useCallback } from "react";
import { supervisorComplaintsQueries } from "@/lib/supabase/queries/supervisor-complaints";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { ComplaintsFilters } from "./_components/ComplaintsFilters";
import { ComplaintsTableView } from "./_components/ComplaintsTableView";
// Component imports...

export default function ComplaintsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [jurisdiction, setJurisdiction] = useState<any>(null);

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

      if (!user) {
        setError("Not authenticated");
        return;
      }

      // Call the service
      const { data } =
        await supervisorComplaintsQueries.getJurisdictionComplaints(
          supabase,
          user.id,
          filters
        );

      setComplaints(data || []);
    } catch (err: any) {
      // THIS IS THE FIX: Set the error state so the spinner stops
      setError(err.message || "Failed to load complaints. Check permissions.");
      toast.error("Security Access Error: Jurisdiction denied.");
    } finally {
      setLoading(false); // ALWAYS stop loading
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Bulk action handlers...

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] gap-6 p-6">
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">
            Active Jurisdiction
          </p>
          <p className="text-sm text-blue-600">
            {jurisdiction?.is_senior
              ? "Full City Access"
              : `Department Scoped View`}
          </p>
        </div>

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

      <div className="flex-1 flex flex-col min-w-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <ComplaintsTableView
            complaints={complaints}
            selectedIds={selectedIds}
            onSelect={(id, sel) =>
              setSelectedIds((p) =>
                sel ? [...p, id] : p.filter((x) => x !== id)
              )
            }
            onSelectAll={(sel) =>
              setSelectedIds(sel ? complaints.map((c) => c.id) : [])
            }
            isLoading={false}
          />
        )}
      </div>
    </div>
  );
}