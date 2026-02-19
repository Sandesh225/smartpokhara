"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { staffApi } from "@/features/staff/api";
import { LoadingSpinner } from "@/components/staff/shared/LoadingSpinner";
 // Added
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/staff/shared/EmptyState"; 
import { QueueContextNavigation } from "./_components/QueueContextNavigation";
import { QueueSearch } from "./_components/QueueSearch";
import { QueueFilterTabs } from "./_components/QueueFilterTabs";
import { QueueCardView } from "./_components/QueueCardView";
import { QueueListView } from "./_components/QueueListView";
import { ViewToggle } from "./_components/ViewToggle";

type ViewMode = 'list' | 'card' | 'map' | 'timeline';

export default function MyQueuePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        const assignments = await staffApi.getStaffAssignments(supabase, user.id);
        setItems(assignments);
      } catch (error) {
        console.error("Failed to load queue", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    let filtered = items;

    if (activeTab !== 'all') {
       if (activeTab === 'not_started') filtered = filtered.filter(i => i.status === 'not_started');
       else if (activeTab === 'in_progress') filtered = filtered.filter(i => i.status === 'in_progress');
       else if (activeTab === 'awaiting') filtered = filtered.filter(i => i.status === 'awaiting_approval' || i.status === 'work_completed');
       else if (activeTab === 'completed') filtered = filtered.filter(i => i.status === 'completed');
       else if (activeTab === 'overdue') filtered = filtered.filter(i => new Date(i.due_at) < new Date() && i.status !== 'completed');
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(i => 
        i.title?.toLowerCase().includes(q) || 
        i.tracking_code?.toLowerCase().includes(q) ||
        i.location?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [items, activeTab, searchQuery]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    c.not_started = items.filter(i => i.status === 'not_started').length;
    c.in_progress = items.filter(i => i.status === 'in_progress').length;
    c.awaiting = items.filter(i => i.status === 'awaiting_approval' || i.status === 'work_completed').length;
    c.completed = items.filter(i => i.status === 'completed').length;
    c.overdue = items.filter(i => new Date(i.due_at) < new Date() && i.status !== 'completed').length;
    return c;
  }, [items]);

  if (loading) return <div className="h-96 flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <QueueContextNavigation /> {/* Added Navigation */}

      <div className="flex flex-col gap-4 bg-gray-50 z-20 pb-2">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Queue</h1>
          <div className="hidden sm:block">
             <ViewToggle mode={viewMode} onChange={setViewMode} />
          </div>
        </div>

        <QueueSearch onSearch={setSearchQuery} />
        <QueueFilterTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />
      </div>

      <div className="min-h-[500px]">
        <div className="sm:hidden space-y-4">
           {filteredItems.length === 0 ? (
             <EmptyState 
               title="No tasks found" 
               description="There are no tasks in this queue matching your filters." 
             />
           ) : (
             <QueueCardView items={filteredItems} />
           )}
        </div>

        <div className="hidden sm:block">
           {filteredItems.length === 0 ? (
              <EmptyState 
                title="No tasks found" 
                description="There are no tasks in this queue matching your filters." 
              />
           ) : (
             <>
               {viewMode === 'list' && <QueueListView items={filteredItems} />}
               {viewMode === 'card' && <QueueCardView items={filteredItems} />}
               {viewMode === 'map' && <div className="p-12 text-center text-gray-400">Map view placeholder</div>}
               {viewMode === 'timeline' && <div className="p-12 text-center text-gray-400">Timeline view placeholder</div>}
             </>
           )}
        </div>
      </div>
    </div>
  );
}