"use client";

import { useState, useEffect } from "react";
import { User, MessageSquare, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityIndicator } from "@/components/shared/PriorityIndicator";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import Link from "next/link";

// Types
interface Assignment {
  id: string;
  type: "complaint" | "task";
  label: string;
  title: string;
  priority: string;
  status: string;
  deadline: string | null;
}

interface WorkloadStaffCard {
  staffId: string;
  name: string;
  photoUrl?: string | null;
  roleTitle: string;
  status: string;
  workloadPercentage: number;
  currentWorkload: number;
  maxWorkload: number;
  assignments: Assignment[];
}

interface WorkloadCardsProps {
  staffCards: WorkloadStaffCard[];
  onReassign: (
    assignmentId: string,
    type: "complaint" | "task",
    toStaffId: string,
    currentOwnerId: string
  ) => Promise<void>;
  onMessage: (staffId: string) => void;
  currentSupervisorId: string;
}

export function WorkloadCards({
  staffCards,
  onReassign,
  onMessage,
}: WorkloadCardsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

const handleReassignClick = async (
    assignmentId: string, 
    type: 'complaint'|'task', 
    targetStaffId: string,
    currentOwnerId: string // <--- We know this from the parent map loop
  ) => {
    try {
      // Pass currentOwnerId to the server action
      await onReassign(assignmentId, type, targetStaffId, currentOwnerId); 
      toast.success("Assignment moved & staff notified");
    } catch (error) {
      toast.error("Failed to move assignment");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {staffCards.map((staff) => {
        const isOverloaded = staff.workloadPercentage >= 80;

        return (
          <div
            key={staff.staffId}
            className="bg-card rounded-xl border border-border shadow-xs flex flex-col h-[600px] hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="p-5 border-b border-border/50">
              <div className="flex justify-between items-start mb-4">
                <Link
                  href={`/supervisor/staff/${staff.staffId}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center overflow-hidden border border-border group-hover:border-primary/50 transition-colors">
                    {staff.photoUrl ? (
                      <img
                        src={staff.photoUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {staff.name}
                    </h3>
                    <p className="text-xs text-muted-foreground capitalize">
                      {staff.roleTitle?.replace(/_/g, " ")}
                    </p>
                  </div>
                </Link>
                <StatusBadge status={staff.status} variant="staff" />
              </div>

              {/* Workload Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground font-medium">Capacity</span>
                  <span
                    className={cn(
                      "font-bold",
                      isOverloaded ? "text-destructive" : "text-foreground"
                    )}
                  >
                    {staff.workloadPercentage}%
                  </span>
                </div>
                <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isOverloaded
                        ? "bg-destructive"
                        : staff.workloadPercentage > 50
                        ? "bg-warning-amber"
                        : "bg-primary"
                    )}
                    style={{
                      width: `${Math.min(staff.workloadPercentage, 100)}%`,
                    }}
                  />
                </div>
                <div className="mt-1 text-xs text-muted-foreground/70 text-right">
                  {staff.currentWorkload} / {staff.maxWorkload} tasks
                </div>
              </div>
            </div>

            {/* Assignments List */}
            <div className="flex-1 overflow-y-auto p-2 bg-muted/10 space-y-2 custom-scrollbar">
              {staff.assignments.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
                  No active assignments
                </div>
              ) : (
                staff.assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="bg-card p-3 rounded-lg border border-border shadow-sm group hover:border-primary/40 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-xs px-1.5 py-0.5 rounded font-mono font-bold",
                            assignment.type === "complaint"
                              ? "bg-info-blue/10 text-info-blue"
                              : "bg-primary/10 text-primary"
                          )}
                        >
                          {assignment.label}
                        </span>
                        <PriorityIndicator
                          priority={assignment.priority}
                          size="sm"
                          showLabel={false}
                        />
                      </div>

                      {/* Reassign Dropdown */}
                      {isMounted && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Move to...
                            </div>
                           {staffCards.filter(s => s.staffId !== staff.staffId).map(target => (
       <DropdownMenuItem 
         key={target.staffId}
         onClick={() => handleReassignClick(
           assignment.id, 
           assignment.type, 
           target.staffId, 
           staff.staffId // <--- PASSING THE OLD OWNER ID
         )}
       >
         {target.name}
       </DropdownMenuItem>
     ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    <p
                      className="text-xs font-medium text-foreground truncate mb-2"
                      title={assignment.title}
                    >
                      {assignment.title}
                    </p>

                    <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-border/50 pt-2">
                      <span className="capitalize px-1.5 py-0.5 bg-muted rounded">
                        {assignment.status?.replace(/_/g, " ")}
                      </span>
                      {assignment.deadline && (
                        <span className="text-warning-amber font-medium">
                          Due: {format(new Date(assignment.deadline), "MMM d")}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-3 border-t border-border grid grid-cols-2 gap-2 bg-card rounded-b-xl">
              <button
                onClick={() => onMessage(staff.staffId)}
                className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-foreground hover:bg-muted rounded-lg transition-colors border border-border"
              >
                <MessageSquare className="h-3.5 w-3.5" /> Message
              </button>
              <Link
                href={`/supervisor/staff/${staff.staffId}`}
                className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors border border-transparent hover:border-primary/20"
              >
                View Profile
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}