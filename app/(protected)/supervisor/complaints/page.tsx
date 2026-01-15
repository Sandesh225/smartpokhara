"use client";

import { useState, useEffect, useCallback } from "react";
import { supervisorComplaintsQueries } from "@/lib/supabase/queries/supervisor-complaints";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Loader2,
  ShieldCheck,
  Filter,
  AlertCircle,
  RefreshCcw,
  X,
} from "lucide-react";

// Flowbite React Imports - Grouped for Better Module Resolution
import { Button, Drawer } from "flowbite-react";

// Local Sub-components
import { ComplaintsFilters } from "./_components/ComplaintsFilters";
import { ComplaintsTableView } from "./_components/ComplaintsTableView";

/**
 * SMART POKHARA - SUPERVISOR COMPLAINTS LEDGER
 * Design: Machhapuchhre Modern (v4)
 */
export default function ComplaintsPage() {
  // --- State Management ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [jurisdiction, setJurisdiction] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Authentication Required");
        return;
      }

      const { data, error: fetchError } =
        await supervisorComplaintsQueries.getJurisdictionComplaints(
          supabase,
          user.id,
          filters
        );

      if (fetchError) throw fetchError;

      setComplaints(data || []);
      // Mock jurisdiction for visual state if data doesn't provide it
      setJurisdiction({ is_senior: true });
    } catch (err: any) {
      setError(err.message || "Access Denied: Check Permissions.");
      toast.error("Security Access Error: Ledger connection failed.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors-smooth">
      {/* 📱 Mobile Header / Filter Toggle */}
      <div className="lg:hidden p-4 flex justify-between items-center glass mb-2">
        <h1 className="text-sm font-black uppercase tracking-tighter text-primary">
          Records Ledger
        </h1>
        <Button
          onClick={() => setIsDrawerOpen(true)}
          size="xs"
          className="bg-primary hover:bg-primary-brand-light border-none accent-glow"
        >
          <Filter className="mr-2 h-3.5 w-3.5" /> Filters
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row h-full max-h-[calc(100vh-4rem)] gap-6 p-4 lg:p-6 overflow-hidden">
        {/* 🏔️ Desktop Sidebar (Sticky Parameters) */}
        <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 gap-6 overflow-y-auto custom-scrollbar">
          <JurisdictionCard jurisdiction={jurisdiction} />

          <div className="flex items-center gap-2 px-1 text-muted-foreground">
            <Filter className="h-4 w-4 text-primary/60" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
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
        </aside>

        {/* 💎 Main Ledger Content (Stone Card) */}
        <main className="flex-1 flex flex-col min-w-0 stone-card dark:stone-card-elevated overflow-hidden border-border/40 shadow-2xl relative">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState error={error} onRetry={fetchData} />
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
        </main>
      </div>

      {/* 🌫️ Mobile Drawer (Using standard divs inside to avoid undefined sub-components) */}
      <Drawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        position="right"
        className="bg-background w-85 p-0 border-l border-border/50"
      >
        <div className="p-5 flex items-center justify-between border-b border-border/30 bg-primary/5">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <span className="text-xs font-black uppercase tracking-widest text-foreground">
              Filter Records
            </span>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-2 hover:bg-destructive/10 rounded-full text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-8 overflow-y-auto h-[calc(100vh-70px)] custom-scrollbar">
          <JurisdictionCard jurisdiction={jurisdiction} />
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">
              Search & Filter
            </p>
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
        </div>
      </Drawer>
    </div>
  );
}

/** --- Sub-Components --- **/

function JurisdictionCard({ jurisdiction }: { jurisdiction: any }) {
  return (
    <div className="stone-card p-5 border-primary/20 bg-primary/5 dark:bg-primary/10 relative overflow-hidden group interactive-card transition-all">
      <div className="absolute -top-2 -right-2 p-2 opacity-10 group-hover:opacity-25 transition-opacity duration-500">
        <ShieldCheck className="h-16 w-16 text-primary" />
      </div>
      <div className="relative z-10">
        <p className="text-[9px] font-black text-primary uppercase tracking-[0.25em] mb-2">
          Security Perimeter
        </p>
        <p className="text-sm font-bold text-foreground leading-tight dark:text-glow">
          {jurisdiction?.is_senior
            ? "City-Wide Clearance"
            : "Department Scoped"}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse accent-glow" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Live Stream Active
          </span>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-card/30 backdrop-blur-md">
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-primary/20" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
        Decrypting Ledger...
      </p>
    </div>
  );
}

function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center gradient-dark-mesh">
      <div className="h-16 w-16 bg-destructive/10 rounded-2xl flex items-center justify-center mb-6 border border-destructive/20 shadow-lg">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-black text-foreground uppercase tracking-tight">
        Access Restricted
      </h3>
      <p className="text-xs text-muted-foreground max-w-xs mt-3 mb-8 leading-relaxed">
        {error}
      </p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl accent-glow border-none"
      >
        <RefreshCcw className="h-3 w-3" /> Reconnect
      </button>
    </div>
  );
}