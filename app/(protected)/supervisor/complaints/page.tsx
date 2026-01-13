"use client";

import { useState, useEffect, useCallback } from "react";
import { supervisorComplaintsQueries } from "@/lib/supabase/queries/supervisor-complaints";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, ShieldCheck, LayoutGrid, Filter } from "lucide-react";
import { ComplaintsFilters } from "./_components/ComplaintsFilters";
import { ComplaintsTableView } from "./_components/ComplaintsTableView";
import { cn } from "@/lib/utils";

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

      const { data } =
        await supervisorComplaintsQueries.getJurisdictionComplaints(
          supabase,
          user.id,
          filters
        );

      setComplaints(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load complaints. Check permissions.");
      toast.error("Security Access Error: Jurisdiction denied.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] gap-6 p-6 bg-background">
      {/* 1. Sidebar Layout (Filters & Context) */}
      <div className="hidden lg:flex flex-col w-72 flex-shrink-0 gap-6">
        {/* Jurisdiction Card */}
        <div className="stone-card p-4 border-primary/20 bg-primary/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldCheck className="h-12 w-12 text-primary" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">
              Active Jurisdiction
            </p>
            <p className="text-sm font-bold text-foreground leading-tight">
              {jurisdiction?.is_senior
                ? "Full City Access"
                : "Department Scoped View"}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                Live Monitoring
              </span>
            </div>
          </div>
        </div>

        {/* Filter Section Header */}
        <div className="flex items-center gap-2 px-1">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Parameters
          </span>
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

      {/* 2. Main Content Area (Table View) */}
      <div className="flex-1 flex flex-col min-w-0 stone-card overflow-hidden shadow-lg border-border/40">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-card/50">
            <div className="relative">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div className="absolute inset-0 h-10 w-10 animate-ping rounded-full bg-primary/20" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
              Syncing Ledger
            </p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="h-16 w-16 bg-destructive/10 rounded-2xl flex items-center justify-center mb-4 border border-destructive/20">
              <LayoutGrid className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Data Access Restricted
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mt-2">
              {error}
            </p>
            <button
              onClick={() => fetchData()}
              className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
            >
              Retry Connection
            </button>
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