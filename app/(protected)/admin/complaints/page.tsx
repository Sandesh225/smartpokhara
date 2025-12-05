// app/(protected)/admin/complaints/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Filter, MapPin, Table } from "lucide-react";
import AdminComplaintsTable from "@/components/admin/complaints/AdminComplaintsTable";
import AdminComplaintsFilters from "@/components/admin/complaints/AdminComplaintsFilters";
import AdminComplaintsMapView from "@/components/admin/complaints/AdminComplaintsMapView";
import BulkActionsToolbar from "@/components/admin/complaints/BulkActionsToolbar";
import { createClient } from "@/lib/supabase/client";
import type { Complaint } from "@/lib/types/complaints";

export default function ComplaintsPage() {
  const [activeTab, setActiveTab] = useState("table");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    status: [] as string[],
    priority: [] as string[],
    ward: [] as string[],
    department: [] as string[],
    dateRange: { from: null as Date | null, to: null as Date | null },
    search: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
  });

  const supabase = createClient();

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("rpc_admin_get_complaints", {
        p_status: filters.status.length > 0 ? filters.status : null,
        p_priority: filters.priority.length > 0 ? filters.priority : null,
        p_ward_id: filters.ward.length > 0 ? filters.ward[0] : null,
        p_department_id:
          filters.department.length > 0 ? filters.department[0] : null,
        p_date_from: filters.dateRange.from?.toISOString() || null,
        p_date_to: filters.dateRange.to?.toISOString() || null,
        p_search_term: filters.search || null,
        p_limit: pagination.limit,
        p_offset: (pagination.page - 1) * pagination.limit,
      });

      if (error) throw error;

      setComplaints(data || []);

      // Get total count for pagination
      const { count } = await supabase
        .from("complaints")
        .select("*", { count: "exact", head: true });

      setPagination((prev) => ({ ...prev, total: count || 0 }));
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [filters, pagination.page]);

  const handleBulkAction = async (action: string, data?: any) => {
    if (selectedIds.length === 0) return;

    try {
      let result;
      switch (action) {
        case "assign":
          result = await supabase.rpc("rpc_admin_bulk_update_complaints", {
            p_complaint_ids: selectedIds,
            p_staff_id: data.staffId,
            p_department_id: data.departmentId,
            p_reason: data.reason,
          });
          break;
        case "status":
          result = await supabase.rpc("rpc_admin_bulk_update_complaints", {
            p_complaint_ids: selectedIds,
            p_status: data.status,
            p_reason: data.reason,
          });
          break;
        case "escalate":
          // Escalate each complaint
          for (const id of selectedIds) {
            await supabase.from("complaint_escalations").insert({
              complaint_id: id,
              escalation_level: 1,
              reason: data.reason,
              escalated_by_user_id: (await supabase.auth.getUser()).data.user
                ?.id,
            });
          }
          break;
      }

      if (result?.error) throw result.error;

      // Refresh complaints
      fetchComplaints();
      setSelectedIds([]);
    } catch (error) {
      console.error("Bulk action error:", error);
    }
  };

  const exportComplaints = async (format: "csv" | "excel") => {
    try {
      const { data, error } = await supabase.rpc(
        "rpc_admin_export_complaints",
        {
          p_format: format,
          p_status: filters.status.length > 0 ? filters.status : null,
          p_date_from: filters.dateRange.from?.toISOString() || null,
          p_date_to: filters.dateRange.to?.toISOString() || null,
        }
      );

      if (error) throw error;

      // In a real app, this would trigger a download
      console.log("Export result:", data);
      alert(`Export started. Download URL: ${data.download_url}`);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Complaints Management
          </h1>
          <p className="text-gray-600 mt-2">
            City-wide complaints overview with advanced filtering
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => exportComplaints("csv")}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportComplaints("excel")}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedIds.length}
          onAction={handleBulkAction}
          onClearSelection={() => setSelectedIds([])}
        />
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by tracking code, citizen name, or description..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="w-full"
            />
          </div>
          <AdminComplaintsFilters
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>
      </div>

      {/* Tabs for Table/Map View */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="table" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            Table View
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Map View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          <AdminComplaintsTable
            complaints={complaints}
            loading={loading}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            pagination={pagination}
            onPaginationChange={setPagination}
          />
        </TabsContent>

        <TabsContent value="map">
          <AdminComplaintsMapView complaints={complaints} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
