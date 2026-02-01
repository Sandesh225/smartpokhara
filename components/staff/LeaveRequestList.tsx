"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Added Router
import { format } from "date-fns";
import { CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { supervisorStaffQueries } from "@/lib/supabase/queries/supervisor-staff";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function LeaveRequestList({ initialLeaves, supervisorId }: { initialLeaves: any[], supervisorId: string }) {
  const [leaves, setLeaves] = useState(initialLeaves);
  const router = useRouter(); // Initialize Router
  const supabase = createClient();

  const handleAction = async (leaveId: string, action: 'approve' | 'reject') => {
    // 1. Optimistic Update
    const previous = [...leaves];
    setLeaves(prev => prev.filter(l => l.id !== leaveId));

    try {
      // 2. Perform DB Action
      if (action === 'approve') {
        await supervisorStaffQueries.approveLeave(supabase, leaveId, supervisorId);
        toast.success("Leave approved & balance updated");
      } else {
        await supervisorStaffQueries.rejectLeave(supabase, leaveId, supervisorId);
        toast.error("Leave rejected");
      }
      
      // 3. Force Data Refresh (Crucial for showing updated balances if you navigate)
      router.refresh(); 

    } catch (error: any) {
      console.error(error);
      setLeaves(previous); // Rollback
      toast.error(`Action failed: ${error.message}`);
    }
  };

  // ... (Keep existing Render Logic) ...
  if (leaves.length === 0) return <div className="p-12 text-center text-gray-500 border border-dashed rounded-xl">No pending requests</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {leaves.map((leave) => (
        <div key={leave.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
           {/* ... (Keep existing Card UI) ... */}
           
           <div className="flex gap-3 mt-4">
             <button 
                onClick={() => handleAction(leave.id, 'reject')}
                className="flex-1 py-2 border border-red-200 text-red-600 font-bold text-xs rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
             >
               <XCircle className="h-4 w-4" /> Reject
             </button>
             <button 
                onClick={() => handleAction(leave.id, 'approve')}
                className="flex-1 py-2 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 shadow-sm transition-colors flex items-center justify-center gap-2"
             >
               <CheckCircle className="h-4 w-4" /> Approve
             </button>
          </div>
        </div>
      ))}
    </div>
  );
}