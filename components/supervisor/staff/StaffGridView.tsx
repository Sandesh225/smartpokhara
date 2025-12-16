"use client";

import { User, MessageSquare, Calendar, MoreHorizontal, ArrowRight } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import type { StaffProfile } from "@/lib/types/supervisor.types";

interface StaffGridViewProps {
  staffList: StaffProfile[];
}

export function StaffGridView({ staffList }: StaffGridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {staffList.map((staff) => {
        const capacity = Math.round((staff.current_workload / staff.max_concurrent_assignments) * 100);
        const isOverloaded = capacity >= 80;

        return (
          <div key={staff.user_id} className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                   {staff.avatar_url ? (
                     <img src={staff.avatar_url} alt="" className="h-full w-full object-cover" />
                   ) : (
                     <User className="h-6 w-6 text-gray-400" />
                   )}
                </div>
                <div className="flex flex-col items-end gap-2">
                   <StatusBadge status={staff.availability_status} variant="staff" />
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-900 truncate" title={staff.full_name}>
                  {staff.full_name}
                </h3>
                <p className="text-xs text-gray-500 capitalize">{staff.role.replace(/_/g, " ")}</p>
                {staff.department_id && <p className="text-xs text-gray-400 mt-0.5">Dept ID: {staff.department_id.slice(0,8)}</p>}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Workload</span>
                  <span className={cn("font-medium", isOverloaded ? "text-red-600" : "text-gray-900")}>
                    {capacity}%
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all",
                      isOverloaded ? "bg-red-500" : capacity > 50 ? "bg-amber-500" : "bg-green-500"
                    )} 
                    style={{ width: `${Math.min(capacity, 100)}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>{staff.current_workload} Active</span>
                  <span>Max {staff.max_concurrent_assignments}</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-2">
              <Link
                href={`/supervisor/staff/${staff.user_id}`}
                className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-white rounded-md transition-colors"
              >
                View Profile
              </Link>
              <Link
                href={`/supervisor/messages/new?staffId=${staff.user_id}`} // Or handle via modal
                className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-white rounded-md transition-colors"
              >
                Message
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}