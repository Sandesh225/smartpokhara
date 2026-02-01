"use client";

import { format } from "date-fns";
import { MapPin, Clock, LogOut, CheckCircle2, UserX } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AttendanceTable({ staff }: { staff: any[] }) {
  
  // Helper to render badge based on computed status
  const renderStatus = (s: any) => {
    if (s.computedStatus === 'checked_out') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
          <LogOut className="w-3 h-3" /> Shift Ended
        </span>
      );
    }
    if (s.computedStatus === 'on_duty') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-600 border border-rose-100">
        <UserX className="w-3 h-3" /> Absent
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Field Agent</th>
              <th className="px-6 py-4">Current Status</th>
              <th className="px-6 py-4">Time Log</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {staff.length === 0 ? (
               <tr><td colSpan={5} className="p-8 text-center text-gray-500">No staff found.</td></tr>
            ) : staff.map((s) => (
              <tr key={s.user_id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-gray-200">
                        <AvatarImage src={s.avatar_url} />
                        <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">{s.full_name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-gray-900">{s.full_name}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide">{s.role.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {renderStatus(s)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col text-xs text-gray-500">
                    {s.attendance?.check_in_time && (
                      <span className="flex items-center gap-1 text-emerald-700">
                        <Clock className="w-3 h-3" /> In: {format(new Date(s.attendance.check_in_time), "HH:mm")}
                      </span>
                    )}
                    {s.attendance?.check_out_time && (
                      <span className="flex items-center gap-1 text-gray-500 mt-0.5">
                        <LogOut className="w-3 h-3" /> Out: {format(new Date(s.attendance.check_out_time), "HH:mm")}
                      </span>
                    )}
                    {!s.attendance && <span className="italic text-gray-400">No records</span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {s.attendance?.check_in_location ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                      <MapPin className="h-3 w-3" /> GPS OK
                    </span>
                  ) : <span className="text-gray-300 text-xs">—</span>}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/supervisor/staff/${s.user_id}`}
                    className="text-blue-600 hover:text-blue-800 text-xs font-bold underline decoration-blue-200 underline-offset-2"
                  >
                    View Profile
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}