"use client";

import { useState } from "react";
import { LogIn, LogOut, MapPin, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { staffAttendanceQueries } from "@/lib/supabase/queries/staff-attendance";
import { getCurrentLocation } from "@/lib/utils/location-helpers";

interface Props {
  initialStatus: 'not_checked_in' | 'on_duty' | 'off_duty';
  checkInTime?: string;
  checkOutTime?: string;
}

export function CheckInOutPanel({ initialStatus, checkInTime, checkOutTime }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [localCheckIn, setLocalCheckIn] = useState(checkInTime);
  const [localCheckOut, setLocalCheckOut] = useState(checkOutTime);
  const supabase = createClient();

  const handleAction = async (action: 'check-in' | 'check-out') => {
    setLoading(true);
    try {
      const location = await getCurrentLocation();
      
      if (action === 'check-in') {
        const res = await staffAttendanceQueries.checkIn(supabase, location || undefined);
        setStatus('on_duty');
        setLocalCheckIn(new Date().toISOString()); // Optimistic/Immediate update
        if (res.success) toast.success("Checked in successfully");
      } else {
        const res = await staffAttendanceQueries.checkOut(supabase, location || undefined);
        setStatus('off_duty');
        setLocalCheckOut(new Date().toISOString());
        if (res.success) toast.success("Checked out successfully");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <MapPin className="w-32 h-32" />
      </div>

      <div className="relative z-10">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Daily Action</h3>
        <p className="text-sm text-gray-500 mb-6">Record your daily attendance.</p>

        {status === 'not_checked_in' && (
          <button 
            onClick={() => handleAction('check-in')}
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-200 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <LogIn className="w-6 h-6" />}
            <span>CHECK IN NOW</span>
          </button>
        )}

        {status === 'on_duty' && (
          <div className="space-y-4">
             <div className="bg-green-50 border border-green-100 p-4 rounded-lg flex items-center gap-3">
               <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-700">
                 <LogIn className="w-5 h-5" />
               </div>
               <div>
                 <p className="text-xs text-green-700 font-bold uppercase">Started Shift</p>
                 <p className="text-lg font-mono font-medium text-gray-900">
                   {localCheckIn ? format(new Date(localCheckIn), "h:mm a") : "--:--"}
                 </p>
               </div>
             </div>
             
             <button 
               onClick={() => handleAction('check-out')}
               disabled={loading}
               className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md shadow-red-200 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
             >
               {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <LogOut className="w-6 h-6" />}
               <span>CHECK OUT</span>
             </button>
          </div>
        )}

        {status === 'off_duty' && (
           <div className="space-y-3">
             <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
               <p className="text-sm font-medium text-gray-900">Shift Completed</p>
               <p className="text-xs text-gray-500 mt-1">Great job today!</p>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2">
                   <p className="text-xs text-gray-500">In</p>
                   <p className="font-mono font-medium">{localCheckIn ? format(new Date(localCheckIn), "h:mm a") : "--"}</p>
                </div>
                <div className="text-center p-2 border-l border-gray-100">
                   <p className="text-xs text-gray-500">Out</p>
                   <p className="font-mono font-medium">{localCheckOut ? format(new Date(localCheckOut), "h:mm a") : "--"}</p>
                </div>
             </div>
           </div>
        )}
      </div>
    </div>
  );
}