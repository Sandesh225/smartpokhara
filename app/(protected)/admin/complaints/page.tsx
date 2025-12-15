"use client";

import { useState, useEffect } from "react";
import { useComplaintManagement } from "@/hooks/admin/useComplaintManagement";
import { ComplaintsTable } from "./_components/ComplaintsTable";
import { ComplaintFilters } from "./_components/ComplaintFilters";
import { BatchActionsToolbar } from "./_components/BatchActionsToolbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Map, Plus, Download, RefreshCw, BarChart3 } from "lucide-react";
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

  return (
    <div className="space-y-6 pb-24">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Complaints Management
          </h1>
          <p className="text-sm text-gray-600">
            Track, manage, and resolve citizen complaints across all wards
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="h-9"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button variant="outline" size="sm" asChild className="h-9">
            <Link href="/admin/complaints/map">
              <Map className="h-4 w-4 mr-2" />
              Map View
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Complaints
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-amber-50 to-white border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {
                  complaints.filter(
                    (c) => c.status === "received" || c.status === "assigned"
                  ).length
                }
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-purple-50 to-white border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {complaints.filter((c) => c.status === "in_progress").length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <RefreshCw
                className="w-6 h-6 text-purple-600 animate-spin"
                style={{ animationDuration: "3s" }}
              />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-green-50 to-white border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {complaints.filter((c) => c.status === "resolved").length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
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

      {/* Data Table */}
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

      {/* Bulk Actions Toolbar */}
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
