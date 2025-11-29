// app/(protected)/staff/field/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database.types";
import { FieldTaskCard } from "@/components/staff/FieldTaskCard";

type Task = Database['public']['Tables']['tasks']['Row'] & {
  related_complaint?: { 
    tracking_code: string; 
    title: string;
    location_point?: any;
    address_text?: string;
  };
  wards?: { ward_number: number; name: string };
};

export default function FieldWorkPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"active" | "completed">("active");

  useEffect(() => {
    loadTasks();
  }, [activeFilter]);

  async function loadTasks() {
    const supabase = createClient();
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from("tasks")
        .select(`
          *,
          related_complaint:complaints(tracking_code, title, location_point, address_text),
          wards(ward_number, name)
        `)
        .eq("assigned_to_user_id", user.id)
        .order("due_date", { ascending: true });

      // Filter by active/completed
      if (activeFilter === "active") {
        query = query.in("status", ["open", "in_progress"]);
      } else {
        query = query.eq("status", "completed");
      }

      const { data, error } = await query;

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-5">
          <h1 className="text-2xl font-semibold text-gray-900">Field Work</h1>
          <p className="mt-2 text-sm text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-semibold text-gray-900">Field Work</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update your task status and report progress from the field.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveFilter("active")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeFilter === "active"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Active Tasks ({tasks.filter(t => ["open", "in_progress"].includes(t.status)).length})
          </button>
          <button
            onClick={() => setActiveFilter("completed")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeFilter === "completed"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Completed Tasks ({tasks.filter(t => t.status === "completed").length})
          </button>
        </nav>
      </div>

      {/* Tasks Grid - Mobile Optimized */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <FieldTaskCard 
            key={task.id} 
            task={task} 
            onStatusUpdate={loadTasks}
          />
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <div className="text-sm text-gray-500">
            {activeFilter === "active" 
              ? "No active tasks assigned to you." 
              : "No completed tasks yet."}
          </div>
        </div>
      )}
    </div>
  );
}