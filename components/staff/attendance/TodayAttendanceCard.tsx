"use client";

import { useState } from "react";
import { MapPin, Clock, LogIn, LogOut } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Props {
  status: 'not_checked_in' | 'on_duty' | 'off_duty';
  checkInTime?: string;
  checkOutTime?: string;
  location?: string;
}

export function TodayAttendanceCard({ status, checkInTime, checkOutTime, location }: Props) {
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    setLoading(true);
    // Call RPC here
    setTimeout(() => {
        toast.success("Checked in successfully");
        setLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-600" /> Today's Attendance
      </h2>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
         <div className="space-y-1 text-center sm:text-left">
            <p className="text-sm text-gray-500 uppercase font-bold tracking-wide">Current Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
               status === 'on_duty' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
            }`}>
               {status === 'not_checked_in' ? "Not Checked In" : status === 'on_duty' ? "On Duty" : "Shift Completed"}
            </span>
         </div>

         {status === 'not_checked_in' && (
           <button 
             onClick={handleCheckIn}
             disabled={loading}
             className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
           >
             <LogIn className="w-5 h-5" /> Check In Now
           </button>
         )}

         {status === 'on_duty' && (
            <div className="flex items-center gap-4">
               <div className="text-right">
                  <p className="text-xs text-gray-500">Started at</p>
                  <p className="font-mono font-bold text-gray-900">{format(new Date(checkInTime!), "h:mm a")}</p>
               </div>
               <button className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center gap-2">
                 <LogOut className="w-4 h-4" /> Check Out
               </button>
            </div>
         )}
      </div>

      {(checkInTime || location) && (
        <div className="mt-6 pt-4 border-t border-gray-100 flex gap-6 text-sm text-gray-600">
           {checkInTime && (
             <div className="flex items-center gap-2">
               <Clock className="w-4 h-4 text-gray-400" />
               <span>In: {format(new Date(checkInTime), "h:mm a")}</span>
             </div>
           )}
           {location && (
             <div className="flex items-center gap-2">
               <MapPin className="w-4 h-4 text-gray-400" />
               <span>{location}</span>
             </div>
           )}
        </div>
      )}
    </div>
  );
}