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
          <div key={staff.user_id} className="group bg-card rounded-xl border border-border shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col">
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-background shadow-xs">
                   {staff.avatar_url ? (
                     <img src={staff.avatar_url} alt="" className="h-full w-full object-cover" />
                   ) : (
                     <User className="h-6 w-6 text-muted-foreground/60" />
                   )}
                </div>
                <div className="flex flex-col items-end gap-2">
                   <StatusBadge status={staff.availability_status} variant="staff" />
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-base font-bold text-foreground truncate" title={staff.full_name}>
                  {staff.full_name}
                </h3>
                <p className="text-xs text-muted-foreground capitalize">{(staff.role || "staff").replace(/_/g, " ")}</p>
                {staff.department_id && <p className="text-xs text-muted-foreground/70 mt-0.5">Dept ID: {staff.department_id.slice(0,8)}</p>}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Workload</span>
                  <span className={cn("font-bold", isOverloaded ? "text-destructive" : "text-foreground")}>
                    {capacity}%
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all",
                      isOverloaded ? "bg-destructive" : capacity > 50 ? "bg-warning-amber" : "bg-success-green"
                    )} 
                    style={{ width: `${Math.min(capacity, 100)}%` }} 
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                  <span>{staff.current_workload} Active</span>
                  <span>Max {staff.max_concurrent_assignments}</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-muted/20 border-t border-border grid grid-cols-2 gap-2">
              <Link
                href={`/supervisor/staff/${staff.user_id}`}
                className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-primary hover:bg-background rounded-md transition-colors"
              >
                View Profile
              </Link>
              <Link
                href={`/supervisor/messages/new?staffId=${staff.user_id}`} // Or handle via modal
                className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-muted-foreground hover:bg-background rounded-md transition-colors hover:text-foreground"
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