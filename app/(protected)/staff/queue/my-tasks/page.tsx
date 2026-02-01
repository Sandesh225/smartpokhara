"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { staffQueueQueries } from "@/lib/supabase/queries/staff-queue";
import { LoadingSpinner } from "@/components/staff/shared/LoadingSpinner";
import { EmptyState } from "@/components/staff/shared/EmptyState";
import { ClipboardList } from "lucide-react";
import { QueueContextNavigation } from "../_components/QueueContextNavigation";
import { QueueSearch } from "../_components/QueueSearch";
import { QueueFilterTabs } from "../_components/QueueFilterTabs";
import { QueueCardView } from "../_components/QueueCardView";

export default function MyTasksPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      try {
        setLoading(true);
        const allAssignments = await staffQueueQueries.getMyAssignments(
          supabase,
          user.id
        );

        // Filter strictly for internal tasks (excluding complaints)
        const tasksOnly = allAssignments.filter((a: any) => a.type === "task");
        setItems(tasksOnly);
      } catch (error) {
        console.error("Failed to load tasks:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [supabase]);

  // --- Filter Logic ---
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Filter by Tab
    if (activeTab !== "all") {
      const now = new Date();
      switch (activeTab) {
        case "not_started":
          filtered = filtered.filter((i) => i.status === "not_started");
          break;
        case "in_progress":
          filtered = filtered.filter((i) => i.status === "in_progress");
          break;
        case "awaiting":
          filtered = filtered.filter((i) => i.status === "awaiting_approval");
          break;
        case "completed":
          filtered = filtered.filter((i) => i.status === "completed");
          break;
        case "overdue":
          filtered = filtered.filter(
            (i) =>
              i.due_at && new Date(i.due_at) < now && i.status !== "completed"
          );
          break;
      }
    }

    // Filter by Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.tracking_code?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [items, activeTab, searchQuery]);

  // --- Counts for Tabs ---
  const counts = useMemo(() => {
    const now = new Date();
    return {
      all: items.length,
      not_started: items.filter((i) => i.status === "not_started").length,
      in_progress: items.filter((i) => i.status === "in_progress").length,
      awaiting: items.filter((i) => i.status === "awaiting_approval").length,
      completed: items.filter((i) => i.status === "completed").length,
      overdue: items.filter(
        (i) => i.due_at && new Date(i.due_at) < now && i.status !== "completed"
      ).length,
    };
  }, [items]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 p-4 lg:p-6">
      {/* Contextual Navigation (Staff Queue / Tasks / History) */}
      <QueueContextNavigation />

      <div className="flex flex-col gap-4 bg-gray-50 z-20 pb-2">
        <div className="flex justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-purple-600" />
              My Internal Tasks
            </h1>
            <p className="text-sm text-gray-500">
              Internal maintenance orders and operational tasks assigned to you.
            </p>
          </div>

          {/* Optional: Add a 'Create Task' button here if applicable */}
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-4">
          <QueueSearch onSearch={setSearchQuery} />
          <QueueFilterTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={counts}
          />
        </div>
      </div>

      {/* Results Section */}
      <div className="min-h-[400px]">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 py-12">
            <EmptyState
              message={
                searchQuery
                  ? `No tasks matching "${searchQuery}"`
                  : "No internal tasks assigned to you."
              }
              description="Switch to 'My Queue' to see citizen complaints."
            />
          </div>
        ) : (
          <div className="grid gap-4">
            <QueueCardView items={filteredItems} />
          </div>
        )}
      </div>
    </div>
  );
}