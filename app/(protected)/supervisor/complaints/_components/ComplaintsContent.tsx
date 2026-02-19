"use client";

import { useState } from "react";
import { Drawer, Badge, Button } from "flowbite-react";
import { Filter, LayoutGrid, Database, X, Search } from "lucide-react";
import { ComplaintsFilters } from "./ComplaintsFilters";
import { ComplaintsTableView } from "./ComplaintsTableView";
import { JurisdictionCard, LoadingState, ErrorState } from './SharedComponents'

interface ComplaintsContentProps {
  initialUserId: string;
  initialComplaints: any[];
  initialJurisdiction: any;
  wards: any[];
  categories: any[];
}

export function ComplaintsContent({
  initialUserId,
  initialComplaints,
  initialJurisdiction,
  wards,
  categories,
}: ComplaintsContentProps) {
  const [complaints, setComplaints] = useState(initialComplaints);
  const [jurisdiction] = useState(initialJurisdiction);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    search: "",
    status: [] as string[],
    priority: [] as string[],
    ward_id: [] as string[],
    category: [] as string[],
  });

  // Note: Refetching logic can be added here using useQuery or similar if needed for live updates

  return (
    <div className="relative min-h-screen bg-background transition-colors duration-500 overflow-hidden flex flex-col">
      {/* 🌌 Background Mesh Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[35%] h-[35%] rounded-full bg-secondary/5 blur-[100px]" />
      </div>

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
            <ErrorState error={error} onRetry={() => {}} />
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
                    setSelectedIds(sel ? complaints.map((c: any) => c.id) : [])
                  }
                  isLoading={false}
                />
              </div>
            </>
          )}
        </main>
      </div>

      {/* 🌫️ Mobile Drawer */}
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
