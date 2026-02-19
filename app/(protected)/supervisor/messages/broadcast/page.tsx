"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Send, Users, Calendar, AlertTriangle, CheckCircle2, 
  History, Radio, Loader2 
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { messagesApi } from "@/features/messages";
import { supervisorApi } from "@/features/supervisor";
import { LoadingSpinner } from "@/components/supervisor/shared/LoadingSpinner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function BroadcastPage() {
  const router = useRouter();
  const supabase = createClient();
  
  // State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [history, setHistory] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);

  // Form State
  const [recipientMode, setRecipientMode] = useState<'all' | 'specific'>('all');
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [channels, setChannels] = useState({ inApp: true, email: false, sms: false });
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later'>('now');
  const [scheduledDate, setScheduledDate] = useState("");

  // Initial Fetch
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);

      const [staffData, historyData] = await Promise.all([
        supervisorApi.getSupervisedStaff(supabase, user.id),
        messagesApi.getBroadcastHistory(supabase, user.id)
      ]);

      setStaffList(staffData);
      setHistory(historyData);
      setLoading(false);
    }
    init();
  }, []);

  // Handlers
  const handleStaffToggle = (id: string) => {
    setSelectedStaffIds(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleBroadcast = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Please enter a title and message");
      return;
    }
    if (recipientMode === 'specific' && selectedStaffIds.length === 0) {
      toast.error("Please select at least one recipient");
      return;
    }

    setSubmitting(true);
    try {
      const targetIds = recipientMode === 'all' 
        ? staffList.map(s => s.user_id) 
        : selectedStaffIds;

      const payload = {
        senderId: userId,
        title,
        body,
        recipients: targetIds,
        channels,
        urgency,
        scheduledAt: scheduleMode === 'later' && scheduledDate ? new Date(scheduledDate).toISOString() : null
      };

      await messagesApi.broadcastMessage(supabase, payload);
      
      toast.success(scheduleMode === 'later' ? "Broadcast scheduled" : "Broadcast sent successfully");
      
      // Reset Form
      setTitle("");
      setBody("");
      setRecipientMode("all");
      setSelectedStaffIds([]);
      setUrgency("normal");
      
      // Refresh History
      const updatedHistory = await messagesApi.getBroadcastHistory(supabase, userId);
      setHistory(updatedHistory);

    } catch (error) {
      console.error(error);
      toast.error("Failed to send broadcast");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="h-96 flex items-center justify-center"><LoadingSpinner /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Send className="h-6 w-6 text-blue-600" />
          Broadcast Announcement
        </h1>
        <p className="text-gray-500 mt-1">Send updates to your entire team or specific members.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Composer */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Recipients */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4 w-4" /> Recipients
            </h3>
            
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-lg flex-1 hover:bg-gray-50 transition-colors">
                <input 
                  type="radio" 
                  name="recipient" 
                  checked={recipientMode === 'all'} 
                  onChange={() => setRecipientMode('all')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="block text-sm font-medium text-gray-900">All Active Staff</span>
                  <span className="block text-xs text-gray-500">{staffList.length} members</span>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-lg flex-1 hover:bg-gray-50 transition-colors">
                <input 
                  type="radio" 
                  name="recipient" 
                  checked={recipientMode === 'specific'} 
                  onChange={() => setRecipientMode('specific')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="block text-sm font-medium text-gray-900">Select Specific Staff</span>
                  <span className="block text-xs text-gray-500">Choose manually</span>
                </div>
              </label>
            </div>

            {recipientMode === 'specific' && (
              <div className="mt-4 border rounded-lg p-2 max-h-48 overflow-y-auto bg-gray-50">
                {staffList.map(staff => (
                  <label key={staff.user_id} className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedStaffIds.includes(staff.user_id)}
                      onChange={() => handleStaffToggle(staff.user_id)}
                      className="rounded text-blue-600"
                    />
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">{staff.full_name}</span>
                      <span className="text-gray-500 ml-2 text-xs">({staff.role.replace(/_/g, ' ')})</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 2. Message */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Message</h3>
            
            <input
              type="text"
              placeholder="Announcement Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
            />
            
            <textarea
              placeholder="Write your message here..."
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
            />
          </div>

          {/* 3. Settings & Send */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Urgency */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Urgency Level</label>
                <select 
                  value={urgency} 
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="normal">Normal Information</option>
                  <option value="high">Important Update</option>
                  <option value="urgent">Critical Alert</option>
                </select>
              </div>

              {/* Schedule */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Schedule</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setScheduleMode('now')}
                    className={cn(
                      "flex-1 py-2 text-sm border rounded-lg transition-colors",
                      scheduleMode === 'now' ? "bg-blue-50 border-blue-500 text-blue-700" : "hover:bg-gray-50"
                    )}
                  >
                    Send Now
                  </button>
                  <button 
                    onClick={() => setScheduleMode('later')}
                    className={cn(
                      "flex-1 py-2 text-sm border rounded-lg transition-colors",
                      scheduleMode === 'later' ? "bg-blue-50 border-blue-500 text-blue-700" : "hover:bg-gray-50"
                    )}
                  >
                    Schedule
                  </button>
                </div>
                {scheduleMode === 'later' && (
                  <input 
                    type="datetime-local" 
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm mt-2"
                  />
                )}
              </div>
            </div>

            {/* Channels */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <label className="text-sm font-medium text-gray-700">Delivery Channels</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" checked={channels.inApp} disabled className="rounded text-blue-600" />
                  In-App Notification (Always On)
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={channels.email} 
                    onChange={(e) => setChannels({...channels, email: e.target.checked})}
                    className="rounded text-blue-600" 
                  />
                  Send Email
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={channels.sms} 
                    onChange={(e) => setChannels({...channels, sms: e.target.checked})}
                    className="rounded text-blue-600" 
                  />
                  Send SMS
                </label>
              </div>
            </div>

            <button
              onClick={handleBroadcast}
              disabled={submitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              {scheduleMode === 'now' ? 'Send Broadcast' : 'Schedule Broadcast'}
            </button>
          </div>
        </div>

        {/* Right Column: History */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
              <History className="h-5 w-5 text-gray-500" />
              Recent Broadcasts
            </h3>

            <div className="flex-1 overflow-y-auto space-y-4 max-h-[600px] pr-2">
              {history.length === 0 ? (
                <div className="text-center text-gray-400 py-8 text-sm">No history yet.</div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="p-4 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors bg-gray-50/50">
                    <div className="flex justify-between items-start mb-1">
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-medium uppercase",
                        item.announcement_type === 'urgent' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {item.announcement_type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(item.created_at), "MMM d")}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 mt-2">{item.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.content}</p>
                    <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> 
                        {item.target_staff_ids?.length || "All"}
                      </span>
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-3 w-3" /> Sent
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}