"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { staffApi } from "@/features/staff/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

import { EmptyState } from "@/components/shared/EmptyState";
import { Users } from "lucide-react";
import { ViewMode, ViewToggle } from "../_components/ViewToggle";
import { QueueSearch } from "../_components/QueueSearch";
import { QueueFilterTabs } from "../_components/QueueFilterTabs";
import { QueueCardView } from "../_components/QueueCardView";
import { QueueListView } from "../_components/QueueListView";

export default function TeamQueuePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
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
        const assignments = await staffApi.getTeamAssignments(
          supabase,
          user.id
        );
        setItems(assignments);
      } catch (error) {
        console.error("Failed to load team queue", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    let filtered = items;

    if (activeTab !== "all") {
      if (activeTab === "not_started")
        filtered = filtered.filter((i) => i.status === "not_started");
      else if (activeTab === "in_progress")
        filtered = filtered.filter((i) => i.status === "in_progress");
      else if (activeTab === "awaiting")
        filtered = filtered.filter((i) => i.status === "awaiting_approval");
      else if (activeTab === "completed")
        filtered = filtered.filter((i) => i.status === "completed");
      else if (activeTab === "overdue")
        filtered = filtered.filter(
          (i) => new Date(i.due_at) < new Date() && i.status !== "completed"
        );
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.tracking_code?.toLowerCase().includes(q) ||
          i.assignee?.name?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [items, activeTab, searchQuery]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    c.not_started = items.filter((i) => i.status === "not_started").length;
    c.in_progress = items.filter((i) => i.status === "in_progress").length;
    c.awaiting = items.filter((i) => i.status === "awaiting_approval").length;
    c.completed = items.filter((i) => i.status === "completed").length;
    c.overdue = items.filter(
      (i) => new Date(i.due_at) < new Date() && i.status !== "completed"
    ).length;
    return c;
  }, [items]);

  if (loading)
    return (
      <div className="h-96 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sticky top-0 bg-gray-50 z-20 pt-2 pb-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Team Queue
            </h1>
            <p className="text-sm text-gray-500">
              Assignments across your team.
            </p>
          </div>
          <div className="hidden sm:block">
            <ViewToggle mode={viewMode} onChange={setViewMode} />
          </div>
        </div>

        <QueueSearch onSearch={setSearchQuery} />
        <QueueFilterTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={counts}
        />
      </div>

      <div className="min-h-[500px]">
        <div className="sm:hidden space-y-4">
          {filteredItems.length === 0 ? (
            <EmptyState title="No tasks found" description="No team tasks found." />
          ) : (
            <QueueCardView items={filteredItems} showAssignee={true} />
          )}
        </div>

        <div className="hidden sm:block">
          {filteredItems.length === 0 ? (
            <EmptyState title="No tasks found" description="No team tasks found." />
          ) : (
            <>
              {viewMode === "list" && (
                <QueueListView items={filteredItems} showAssignee={true} />
              )}
              {viewMode === "card" && (
                <QueueCardView items={filteredItems} showAssignee={true} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
