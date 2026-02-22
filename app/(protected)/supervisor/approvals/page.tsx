"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { supervisorApi } from "@/features/supervisor";
import { Check, X, Calendar, Clock, History, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function SupervisorApprovalsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [historyRequests, setHistoryRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [pending, history] = await Promise.all([
      supervisorApi.getPendingRequests(supabase, user.id),
      supervisorApi.getLeaveHistory(supabase, user.id)
    ]);

    setPendingRequests(pending);
    setHistoryRequests(history);
    setLoading(false);
  }

  const handleProcess = async (id: string, action: 'approved' | 'rejected') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      await supervisorApi.processRequest(supabase, id, user.id, action);
      toast.success(`Request ${action} successfully`);
      
      // Move item from pending to history locally to update UI instantly
      const processedItem = pendingRequests.find(r => r.id === id);
      if (processedItem) {
        setPendingRequests(prev => prev.filter(r => r.id !== id));
        setHistoryRequests(prev => [{ ...processedItem, status: action, approved_at: new Date().toISOString() }, ...prev]);
      }
    } catch (err) {
      toast.error("Action failed");
      console.error(err);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500 animate-pulse">Loading leave data...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-sm text-gray-500">Review requests and view team leave history.</p>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg self-start md:self-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={cn(
              "px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center gap-2",
              activeTab === 'pending' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <AlertCircle className="w-4 h-4" />
            Approvals
            {pendingRequests.length > 0 && (
              <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-xs ml-1">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center gap-2",
              activeTab === 'history' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <History className="w-4 h-4" />
            History
          </button>
        </div>
      </div>

      {/* --- PENDING TAB --- */}
      {activeTab === 'pending' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {pendingRequests.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-500">
              <Check className="w-12 h-12 mx-auto text-green-200 mb-3" />
              <p>All caught up! No pending requests.</p>
            </div>
          ) : (
            pendingRequests.map((req) => (
              <LeaveRequestCard 
                key={req.id} 
                req={req} 
                onProcess={handleProcess} 
                variant="action"
              />
            ))
          )}
        </div>
      )}

      {/* --- HISTORY TAB --- */}
      {activeTab === 'history' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {historyRequests.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-500">
              <p>No leave history found for your team.</p>
            </div>
          ) : (
            historyRequests.map((req) => (
              <LeaveRequestCard 
                key={req.id} 
                req={req} 
                variant="readonly"
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Sub-component for individual card
function LeaveRequestCard({ req, onProcess, variant }: { req: any, onProcess?: any, variant: 'action' | 'readonly' }) {
  const statusColors: any = {
    approved: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
    cancelled: "bg-gray-100 text-gray-700 border-gray-200",
    pending: "bg-blue-100 text-blue-700 border-blue-200"
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6">
      
      {/* Staff Info */}
      <div className="flex items-start gap-4 md:w-1/3">
        <Avatar className="h-12 w-12 border border-gray-100">
          <AvatarImage src={req.requester.user.profile.profile_photo_url} />
          <AvatarFallback className="bg-gray-100 text-gray-500 font-bold">
            {req.requester.user.profile.full_name[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-bold text-gray-900">{req.requester.user.profile.full_name}</h3>
          <p className="text-xs text-gray-500 font-mono">{req.requester.staff_code}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold text-blue-600 capitalize bg-blue-50 px-2 py-0.5 rounded">
              {req.leave_type}
            </span>
            {variant === 'readonly' && (
              <span className={`text-xs px-2 py-0.5 rounded-full uppercase font-bold border ${statusColors[req.status]}`}>
                {req.status}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Leave Details */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>
            {format(new Date(req.start_date), "MMM d")} - {format(new Date(req.end_date), "MMM d, yyyy")}
          </span>
          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-600 ml-2 font-bold">
            {req.total_days} Days
          </span>
        </div>
        
        {req.reason && (
          <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 italic border border-gray-100">
            "{req.reason}"
          </div>
        )}
        
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Requested {format(new Date(req.created_at), "MMM d")}
          </span>
          {variant === 'readonly' && req.approved_at && (
             <span>
               • {req.status === 'approved' ? 'Approved' : 'Rejected'} on {format(new Date(req.approved_at), "MMM d")}
             </span>
          )}
        </div>
      </div>

      {/* Actions (Only for Pending) */}
      {variant === 'action' && onProcess && (
        <div className="flex flex-row md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
          <button 
            onClick={() => onProcess(req.id, 'approved')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
          >
            <Check className="w-4 h-4" /> Approve
          </button>
          <button 
            onClick={() => onProcess(req.id, 'rejected')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            <X className="w-4 h-4" /> Reject
          </button>
        </div>
      )}

    </div>
  );
}