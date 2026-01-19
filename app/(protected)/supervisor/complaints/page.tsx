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
  Search,
  Database,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";

// Flowbite React - Standard Imports
import { Button, Drawer, Badge } from "flowbite-react";

// Local Sub-components (Ensure these are exported correctly in their files)
import { ComplaintsFilters } from "./_components/ComplaintsFilters";
import { ComplaintsTableView } from "./_components/ComplaintsTableView";

/**
 * SMART POKHARA - SUPERVISOR COMPLAINTS LEDGER
 * Design: Machhapuchhre Modern (v4)
 */
export default function ComplaintsPage() {
  // --- State ---
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

  const [wards, setWards] = useState([]);
  const [categories, setCategories] = useState([]);

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
        setError("Session Expired: Re-authentication Required");
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
      setJurisdiction({
        is_senior: true,
        node: "Pokhara-HQ-01",
        lastSync: new Date().toLocaleTimeString(),
      });
    } catch (err: any) {
      setError(err.message || "Ledger Link Failed");
      toast.error("Handshake Error: Encrypted link unstable.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="relative min-h-screen bg-background transition-colors duration-500 overflow-hidden flex flex-col">
      {/* 🌌 Background Mesh Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[35%] h-[35%] rounded-full bg-secondary/5 blur-[100px]" />
      </div>

      {/* 📱 Mobile Top Bar */}
      <header className="lg:hidden flex items-center justify-between p-4 glass border-b border-border/50 z-30">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-lg">
            <Database className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-tighter text-foreground">
            Records Ledger
          </span>
        </div>
        <Button
          onClick={() => setIsDrawerOpen(true)}
          size="xs"
          className="bg-primary hover:bg-primary-brand-light border-none accent-glow"
        >
          <Filter className="mr-2 h-3.5 w-3.5" /> Filters
        </Button>
      </header>

      {/* 🏢 Desktop Dashboard Layout */}
      <div className="flex-1 flex flex-row p-4 lg:p-6 gap-6 relative z-10 overflow-hidden h-[calc(100vh-10px)]">
        {/* 🏔️ Sidebar: Parameters & Stats */}
        <aside className="hidden lg:flex flex-col w-80 shrink-0 gap-6 overflow-y-auto custom-scrollbar pr-2">
          <JurisdictionCard jurisdiction={jurisdiction} />

          <div className="flex-1 glass border-border/40 rounded-3xl p-6 shadow-inner flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">
                  Parameters
                </span>
              </div>
              <button
                onClick={() =>
                  setFilters({
                    search: "",
                    status: [],
                    priority: [],
                    ward_id: [],
                    category: [],
                  })
                }
                className="text-[9px] font-bold text-muted-foreground hover:text-destructive transition-colors uppercase"
              >
                Reset All
              </button>
            </div>

            <ComplaintsFilters
              filters={filters}
              onChange={(key, value) =>
                setFilters((prev) => ({ ...prev, [key]: value }))
              }
              onClear={() => {}}
              wards={wards}
              categories={categories}
            />
          </div>
        </aside>

        {/* 💎 Main Content: The Ledger */}
        <main className="flex-1 flex flex-col min-w-0 stone-card bg-card/40 backdrop-blur-xl border-border/40 shadow-2xl relative overflow-hidden rounded-3xl">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState error={error} onRetry={fetchData} />
          ) : (
            <>
              {/* Ledger Header Toolstrip */}
              <div className="p-4 border-b border-border/30 bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="hidden md:block text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Infrastructure Grid
                  </h2>
                  <Badge
                    color="gray"
                    size="sm"
                    className="rounded-md font-mono"
                  >
                    {complaints.length} OBJECTS LOADED
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="xs"
                    color="gray"
                    className="rounded-lg border-border/50"
                  >
                    Export
                  </Button>
                  <Button
                    size="xs"
                    color="gray"
                    className="rounded-lg border-border/50"
                  >
                    Print
                  </Button>
                </div>
              </div>

              {/* Scrollable Table Area */}
              <div className="flex-1 overflow-auto custom-scrollbar">
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
              </div>
            </>
          )}
        </main>
      </div>

      {/* 🌫️ Mobile Drawer (Custom Content to avoid Flowbite sub-component errors) */}
      <Drawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        position="right"
        className="bg-background/95 backdrop-blur-2xl w-80 p-0 border-l border-border/50"
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
            className="p-2 hover:bg-destructive/10 rounded-xl text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-8 overflow-y-auto h-[calc(100vh-70px)] custom-scrollbar">
          <JurisdictionCard jurisdiction={jurisdiction} />
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
              <Search className="h-3 w-3" /> Search & Filter
            </p>
            <ComplaintsFilters
              filters={filters}
              onChange={(key, value) =>
                setFilters((prev) => ({ ...prev, [key]: value }))
              }
              onClear={() => {}}
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
    <div className="relative group overflow-hidden rounded-3xl bg-primary/5 border border-primary/20 p-6 interactive-card shadow-sm">
      <div className="absolute -top-4 -right-4 p-2 opacity-5 group-hover:opacity-10 transition-opacity duration-700 rotate-12">
        <ShieldCheck size={120} className="text-primary" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <span className="text-[9px] font-black text-primary uppercase tracking-[0.25em]">
            Clearance Verified
          </span>
        </div>

        <p className="text-sm font-bold text-foreground leading-tight dark:text-glow">
          {jurisdiction?.is_senior
            ? "Metropolitan General Ledger"
            : "District Scoped Node"}
        </p>
        <p className="text-[10px] font-medium text-muted-foreground mt-1">
          Active Node: {jurisdiction?.node || "Identifying..."}
        </p>

        <div className="mt-5 pt-4 border-t border-primary/10 flex justify-between items-center">
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
            Last Sync
          </span>
          <span className="text-[10px] font-mono font-bold text-primary">
            {jurisdiction?.lastSync || "--:--"}
          </span>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="h-16 w-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Database className="h-6 w-6 text-primary animate-pulse" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground">
          Decrypting Ledger
        </p>
        <p className="text-[9px] text-muted-foreground mt-2 animate-pulse">
          Establishing Secure Handshake with Pokhara Node...
        </p>
      </div>
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
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
      <div className="h-20 w-20 bg-destructive/10 rounded-3xl flex items-center justify-center mb-6 border border-destructive/20 shadow-2xl text-destructive">
        <AlertCircle size={40} />
      </div>
      <h3 className="text-lg font-black text-foreground uppercase tracking-tight">
        Access Restricted
      </h3>
      <p className="text-xs text-muted-foreground max-w-xs mt-3 mb-8 leading-relaxed">
        {error}
      </p>
      <Button
        onClick={onRetry}
        className="bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl accent-glow border-none px-6"
      >
        <RefreshCcw className="mr-2 h-3.5 w-3.5" /> Reconnect Terminal
      </Button>
    </div>
  );
}