"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, User, MapPin, Plus, Trash2, Save, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { supervisorTasksQueries } from "@/lib/supabase/queries/supervisor-tasks";
import { LoadingSpinner } from "@/components/supervisor/shared/LoadingSpinner";
import { toast } from "sonner";
import type { StaffProfile } from "@/lib/types/supervisor.types";

interface Props {
  supervisedStaff: StaffProfile[];
  supervisorId: string;
}

export function TaskCreationForm({ supervisedStaff, supervisorId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("preventive_maintenance");
  const [priority, setPriority] = useState("medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [wardId, setWardId] = useState(""); // Simplified for demo, could be select
  const [checklist, setChecklist] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      setChecklist([...checklist, newItem.trim()]);
      setNewItem("");
    }
  };

  const removeChecklist = (index: number) => {
    setChecklist(checklist.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !assignedTo || !dueDate) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      const trackingCode = `TSK-${Date.now().toString().slice(-6)}`;
      
      await supervisorTasksQueries.createTask(supabase, {
        title,
        description,
        task_type: type,
        priority,
        primary_assigned_to: assignedTo,
        assigned_to: [assignedTo], // Array format support
        due_date: new Date(dueDate).toISOString(),
        supervisor_id: supervisorId,
        tracking_code: trackingCode,
        status: 'not_started',
        // ward_id: wardId || null, // Uncomment if you have Ward selector logic
      }, checklist);

      toast.success("Task created successfully");
      router.push("/supervisor/tasks");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {/* 1. Basic Info */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Task Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title <span className="text-red-500">*</span></label>
            <input 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Inspect Water Pump Station A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg bg-white"
            >
              <option value="preventive_maintenance">Preventive Maintenance</option>
              <option value="inspection">Inspection</option>
              <option value="follow_up">Follow Up</option>
              <option value="administrative">Administrative</option>
              <option value="emergency_response">Emergency Response</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select 
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg bg-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Detailed instructions for the staff..."
            />
          </div>
        </div>
      </div>

      {/* 2. Assignment & Schedule */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Assignment & Schedule</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To <span className="text-red-500">*</span></label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select 
                required
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white appearance-none"
              >
                <option value="">Select Staff Member</option>
                {supervisedStaff.map(s => (
                  <option key={s.user_id} value={s.user_id}>{s.full_name} ({s.role})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date <span className="text-red-500">*</span></label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="datetime-local"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Checklist */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Checklist (Optional)</h3>
        
        <div className="flex gap-2">
          <input 
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist(e)}
            placeholder="Add a checklist item..."
            className="flex-1 p-2.5 border border-gray-300 rounded-lg text-sm outline-none"
          />
          <button 
            type="button"
            onClick={handleAddChecklist}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <ul className="space-y-2">
          {checklist.map((item, idx) => (
            <li key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group">
              <span className="text-sm text-gray-700">{item}</span>
              <button 
                type="button" 
                onClick={() => removeChecklist(idx)}
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button 
          type="button" 
          onClick={() => router.back()}
          className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 shadow-sm"
        >
          {loading ? <LoadingSpinner size="sm" className="text-white" /> : <Save className="h-4 w-4" />}
          Create Task
        </button>
      </div>
    </form>
  );
}