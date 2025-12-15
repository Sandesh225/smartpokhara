"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { staffQueueQueries } from "@/lib/supabase/queries/staff-queue";
import { LoadingSpinner } from "@/components/staff/shared/LoadingSpinner";
import { QueueFilterTabs } from "@/components/staff/queue/QueueFilterTabs";
import { QueueSearch } from "@/components/staff/queue/QueueSearch";
import { QueueListView } from "@/components/staff/queue/QueueListView";
import { QueueCardView } from "@/components/staff/queue/QueueCardView";
import { QueueContextNavigation } from "@/components/staff/queue/QueueContextNavigation";
import { EmptyState } from "@/components/staff/shared/EmptyState";
import { ClipboardList } from "lucide-react";

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
        const allAssignments = await staffQueueQueries.getMyAssignments(
          supabase,
          user.id
        );
        // Filter strictly for internal tasks (not complaints)
        const tasksOnly = allAssignments.filter((a: any) => a.type === "task");
        setItems(tasksOnly);
      } catch (error) {
        console.error("Failed to load tasks", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter Logic
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
      filtered = filtered.filter((i) => i.title?.toLowerCase().includes(q));
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
      <QueueContextNavigation />

      <div className="flex flex-col gap-4 bg-gray-50 z-20 pb-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-purple-600" />
              My Tasks (Internal)
            </h1>
            <p className="text-sm text-gray-500">
              Internal maintenance orders and tasks only.
            </p>
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
        {filteredItems.length === 0 ? (
          <EmptyState message="No internal tasks assigned (Check 'My Queue' for complaints)." />
        ) : (
          <div className="grid gap-4">
            <QueueCardView items={filteredItems} />
          </div>
        )}
      </div>
    </div>
  );
}
