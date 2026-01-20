"use client";

import { useState, useEffect } from "react";
import { useComplaintManagement } from "@/hooks/admin/useComplaintManagement";
import { ComplaintsTable } from "./_components/ComplaintsTable";
import { ComplaintFilters } from "./_components/ComplaintFilters";
import { BatchActionsToolbar } from "./_components/BatchActionsToolbar";
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
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AdminComplaintsPage() {
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
  } = useComplaintManagement();

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
    (c) => c.status === "received" || c.status === "assigned"
  ).length;
  const inProgressCount = complaints.filter(
    (c) => c.status === "in_progress"
  ).length;
  const resolvedCount = complaints.filter(
    (c) => c.status === "resolved"
  ).length;

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-24 px-2 sm:px-4 lg:px-6">
      {/* RESPONSIVE HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 pt-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tighter">
            Complaints Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Track, manage, and resolve citizen complaints across all wards
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
              className={`h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="outline" size="sm" asChild className="h-9 text-xs">
            <Link href="/admin/complaints/map">
              <Map className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Map View</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="h-9 text-xs">
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* RESPONSIVE STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Total Complaints */}
        <Card className="stone-card p-4 md:p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 md:p-2.5 bg-primary/10 rounded-lg md:rounded-xl group-hover:scale-110 transition-transform">
              <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <div className="text-xs md:text-sm font-bold text-success-green">
              +12%
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total
            </p>
            <p className="text-xl md:text-2xl lg:text-3xl font-black text-foreground tracking-tight">
              {totalCount}
            </p>
          </div>
        </Card>

        {/* Pending */}
        <Card className="stone-card p-4 md:p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 md:p-2.5 bg-warning-amber/10 rounded-lg md:rounded-xl group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-warning-amber" />
            </div>
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning-amber opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-warning-amber"></span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Pending
            </p>
            <p className="text-xl md:text-2xl lg:text-3xl font-black text-foreground tracking-tight">
              {pendingCount}
            </p>
          </div>
        </Card>

        {/* In Progress */}
        <Card className="stone-card p-4 md:p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 md:p-2.5 bg-info-blue/10 rounded-lg md:rounded-xl group-hover:scale-110 transition-transform">
              <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-info-blue" />
            </div>
            <div className="text-xs md:text-sm font-bold text-info-blue">
              Active
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wide">
              In Progress
            </p>
            <p className="text-xl md:text-2xl lg:text-3xl font-black text-foreground tracking-tight">
              {inProgressCount}
            </p>
          </div>
        </Card>

        {/* Resolved */}
        <Card className="stone-card p-4 md:p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 md:p-2.5 bg-success-green/10 rounded-lg md:rounded-xl group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-success-green" />
            </div>
            <div className="text-xs md:text-sm font-bold text-success-green">
              +24%
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Resolved
            </p>
            <p className="text-xl md:text-2xl lg:text-3xl font-black text-foreground tracking-tight">
              {resolvedCount}
            </p>
          </div>
        </Card>
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

      {/* DATA TABLE */}
      <ComplaintsTable
        data={complaints}
        loading={loading}
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

      {/* BATCH ACTIONS TOOLBAR */}
      {selectedIds.length > 0 && (
        <BatchActionsToolbar
          selectedCount={selectedIds.length}
          onClear={() => setSelectedIds([])}
          onStatusChange={(status) => {
            if (
              confirm(
                `Update ${selectedIds.length} complaint(s) to ${status.replace("_", " ")}?`
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