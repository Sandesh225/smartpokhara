"use client";

import { useState, useEffect } from "react";
import { useComplaintManagement } from "@/features/complaints";
import { ComplaintsTable } from "@/app/(protected)/admin/complaints/_components/ComplaintsTable";
import { ComplaintFilters } from "@/app/(protected)/admin/complaints/_components/ComplaintFilters";
import { BatchActionsToolbar } from "@/app/(protected)/admin/complaints/_components/BatchActionsToolbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Map,
  Download,
  RefreshCw,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Clock,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { UniversalStatCard } from "@/components/shared";

export default function SupervisorComplaintsPage() {
  const {
    complaints,
    loading,
    totalCount,
    page,
    setPage,
    filters,
    setFilters,
    refresh,
    handleBulkStatusUpdate,
  } = useComplaintManagement("SUPERVISOR");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  useEffect(() => {
    const fetchWards = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("wards")
        .select("id, ward_number")
        .order("ward_number");
      if (data) setWards(data);
    };
    fetchWards();
  }, []);

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? complaints.map((c) => c.id) : []);
  };

  // Calculate stats
  const pendingCount = complaints.filter(
    (c) => c.status === "received" || c.status === "under_review" || c.status === "assigned"
  ).length;
  const inProgressCount = complaints.filter(
    (c) => c.status === "in_progress"
  ).length;
  const resolvedCount = complaints.filter(
    (c) => c.status === "resolved" || c.status === "closed"
  ).length;

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-24 px-2 sm:px-4 lg:px-6 animate-in fade-in duration-500">
      {/* RESPONSIVE HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 pt-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tighter">
            Jurisdiction Complaints
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage, assign, and resolve citizen requests within your assigned sectors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="h-9 text-xs"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 ${
                loading ? "animate-spin" : ""
              }`}
            />
            <span className="hidden sm:inline">Refresh Sync</span>
          </Button>
          <Button variant="outline" size="sm" asChild className="h-9 text-xs">
            <Link href="/supervisor/complaints/map">
              <Map className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Map View</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="h-9 text-xs">
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </div>
      </div>

      {/* RESPONSIVE STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <UniversalStatCard
          label="Total Found"
          value={totalCount}
          icon={BarChart3}
          subtitle="Live system count"
          iconClassName="text-primary"
        />

        <UniversalStatCard
          label="Pending Action"
          value={pendingCount}
          icon={Clock}
          color="text-amber-500"
          bg="bg-amber-500/10"
          subtitle="Awaiting supervisor"
        />

        <UniversalStatCard
          label="In Progress"
          value={inProgressCount}
          icon={AlertCircle}
          color="text-blue-500"
          bg="bg-blue-500/10"
          subtitle="Active field work"
        />

        <UniversalStatCard
          label="Resolved Today"
          value={resolvedCount}
          icon={CheckCircle2}
          color="text-emerald-500"
          bg="bg-emerald-500/10"
          subtitle="Closed successfully"
        />
      </div>

      {/* FILTERS */}
      <ComplaintFilters
        filters={filters}
        onFilterChange={setFilters}
        wards={wards}
        onClear={() =>
          setFilters({
            search: "",
            status: [],
            priority: [],
            ward_id: null,
            category_id: null,
            date_range: { from: null, to: null },
          })
        }
      />

      {/* DATA TABLE (Universal) */}
      <ComplaintsTable
        data={complaints}
        loading={loading}
        portalMode="SUPERVISOR"
        selectedIds={selectedIds}
        onSelect={handleSelect}
        onSelectAll={handleSelectAll}
        pagination={{
          pageIndex: page,
          pageSize: 20,
          total: totalCount,
          onPageChange: setPage,
        }}
      />

      {/* BATCH ACTIONS TOOLBAR (Universal) */}
      {selectedIds.length > 0 && (
        <BatchActionsToolbar
          selectedCount={selectedIds.length}
          onClear={() => setSelectedIds([])}
          onStatusChange={(status) => {
            if (
              confirm(
                `Update ${selectedIds.length} complaint(s) to ${status.replace(
                  "_",
                  " "
                )}?`
              )
            ) {
              handleBulkStatusUpdate(selectedIds, status);
              setSelectedIds([]);
            }
          }}
        />
      )}
    </div>
  );
}
