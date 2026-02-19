// app/(protected)/staff/tasks/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database.types";

type Task = any;
type TaskActivity = any;

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    loadTaskDetails();
  }, [params.id]);

  async function loadTaskDetails() {
    const supabase = createClient();
    
    try {
      // Load task
      const { data: taskData, error: taskError } = await supabase
        .from("supervisor_tasks")
        .select(`
          *,
          related_complaint:complaints(tracking_code, title, description, location_point, address_text),
          assignee:users!supervisor_tasks_primary_assigned_to_fkey(user_profiles(full_name, phone)),
          supervisor:users!supervisor_tasks_supervisor_id_fkey(user_profiles(full_name)),
          ward:wards(ward_number, name),
          assigned_department:departments(name)
        `)
        .eq("id", params.id)
        .single();

      if (taskError) throw taskError;
      setTask(taskData);

      // Load activity logs
      const { data: activityData, error: activityError } = await supabase
        .from("internal_notes")
        .select(`
          *,
          author:users!internal_notes_supervisor_id_fkey(user_profiles(full_name))
        `)
        .eq("task_id", params.id)
        .order("created_at", { ascending: false });

      if (activityError) throw activityError;
      setActivities(activityData || []);

    } catch (error) {
      console.error("Error loading task details:", error);
    } finally {
      setLoading(false);
    }
  }

  const updateTaskStatus = async (newStatus: string) => {
    setUpdating(true);
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from("supervisor_tasks")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", params.id);

      if (error) throw error;
      
      // Log activity
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("internal_notes").insert({
        task_id: params.id,
        supervisor_id: user?.id,
        content: `Status changed to ${newStatus}`,
        is_private: false
      });

      await loadTaskDetails();
    } catch (error) {
      console.error("Error updating task status:", error);
      alert("Failed to update task status");
    } finally {
      setUpdating(false);
    }
  };

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const supabase = createClient();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("internal_notes")
        .insert({
          task_id: params.id,
          supervisor_id: user?.id,
          content: newNote,
          is_private: false
        });

      if (error) throw error;

      setNewNote("");
      await loadTaskDetails();
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Failed to add note");
    }
  };

  const openInMaps = () => {
    if (task?.related_complaint?.location_point) {
      const [lng, lat] = task.related_complaint.location_point.coordinates;
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    } else if (task?.related_complaint?.address_text) {
      window.open(`https://www.google.com/maps?q=${encodeURIComponent(task.related_complaint.address_text)}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-5">
          <h1 className="text-2xl font-semibold text-gray-900">Loading task...</h1>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-5">
          <h1 className="text-2xl font-semibold text-gray-900">Task not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <Link
              href="/staff/tasks"
              className="text-sm text-blue-600 hover:text-blue-500 mb-2 inline-block"
            >
              ← Back to Tasks
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">{task.title}</h1>
            <p className="mt-2 text-sm text-gray-600">Task ID: {task.id.slice(0, 8)}</p>
          </div>
          <div className="flex gap-2">
            {task.status === "open" && (
              <button
                onClick={() => updateTaskStatus("in_progress")}
                disabled={updating}
                className="rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 disabled:opacity-50"
              >
                Start Work
              </button>
            )}
            {task.status === "in_progress" && (
              <button
                onClick={() => updateTaskStatus("completed")}
                disabled={updating}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                Mark Complete
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Details */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Task Details</h2>
            
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {task.description || "No description provided"}
                </dd>
              </div>

              {task.related_complaint && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Related Complaint</dt>
                  <dd className="mt-1">
                    <Link
                      href={`/staff/complaints/${task.related_complaint_id}`}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      {task.related_complaint.tracking_code} - {task.related_complaint.title}
                    </Link>
                    {task.related_complaint.description && (
                      <p className="mt-1 text-sm text-gray-600">
                        {task.related_complaint.description}
                      </p>
                    )}
                  </dd>
                </div>
              )}

              {(task.related_complaint?.location_point || task.related_complaint?.address_text) && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <span className="text-sm text-gray-900">
                      {task.related_complaint.address_text || "Pinned location"}
                    </span>
                    <button
                      onClick={openInMaps}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      Open in Maps →
                    </button>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Activity Timeline */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Activity Timeline</h2>
            
            <div className="flow-root">
              <ul className="-mb-8">
                {activities.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== activities.length - 1 && (
                        <span
                          className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
                            <svg className="h-4 w-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-900">
                              <span className="font-medium">{activity.author?.user_profiles?.full_name || "System"}</span>
                            </p>
                            <div className="mt-1 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                              {activity.content}
                            </div>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500">
                            {new Date(activity.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Add Note Form */}
            <form onSubmit={addNote} className="mt-6">
              <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                Add Note
              </label>
              <div className="mt-1 flex gap-2">
                <textarea
                  id="note"
                  rows={3}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Add a note or update..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={!newNote.trim()}
                className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Add Note
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Status</h3>
            <select
              value={task.status}
              onChange={(e) => updateTaskStatus(e.target.value)}
              disabled={updating}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Task Info Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Task Information</h3>
            
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Priority</dt>
                <dd className="mt-1">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    task.priority === 'critical' ? 'bg-red-100 text-red-800' :
                    task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    task.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.priority}
                  </span>
                </dd>
              </div>

              {task.due_date && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(task.due_date).toLocaleDateString()}
                  </dd>
                </div>
              )}

              {task.assigned_to_user && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {task.assigned_to_user.user_profiles?.full_name}
                    {task.assigned_to_user.user_profiles?.phone && (
                      <div className="text-gray-500">
                        {task.assigned_to_user.user_profiles.phone}
                      </div>
                    )}
                  </dd>
                </div>
              )}

              {task.assigned_by_user && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Assigned By</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {task.assigned_by_user.user_profiles?.full_name}
                  </dd>
                </div>
              )}

              {task.wards && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Ward</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    Ward {task.wards.ward_number} - {task.wards.name}
                  </dd>
                </div>
              )}

              {task.assigned_department && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Department</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {task.assigned_department.name}
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(task.created_at).toLocaleString()}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(task.updated_at).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}