"use client";

import { useState, useEffect } from "react";
import { User, MessageSquare, MoreHorizontal, ArrowRight, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityIndicator } from "@/components/supervisor/shared/PriorityIndicator";
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import Link from "next/link";

interface Assignment {
  id: string;
  type: 'complaint' | 'task';
  label: string;
  title: string;
  priority: string;
  status: string;
  deadline: string | null;
}

interface WorkloadStaffCard {
  staffId: string;
  name: string;
  photoUrl?: string;
  roleTitle: string;
  status: string;
  workloadPercentage: number;
  currentWorkload: number;
  maxWorkload: number;
  assignments: Assignment[];
}

interface WorkloadCardsProps {
  staffCards: WorkloadStaffCard[];
  onReassign: (assignmentId: string, type: 'complaint'|'task', toStaffId: string) => Promise<void>;
  onMessage: (staffId: string) => void;
  currentSupervisorId: string;
}

export function WorkloadCards({ staffCards, onReassign, onMessage }: WorkloadCardsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleReassignClick = async (assignmentId: string, type: 'complaint'|'task', targetStaffId: string) => {
    try {
      await onReassign(assignmentId, type, targetStaffId);
      toast.success("Assignment moved successfully");
    } catch (error) {
      toast.error("Failed to move assignment");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {staffCards.map((staff) => {
        const isOverloaded = staff.workloadPercentage >= 80;

        return (
          <div key={staff.staffId} className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[600px]">
            {/* Header */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <Link href={`/supervisor/staff/${staff.staffId}`} className="flex items-center gap-3 group">
                  <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200 group-hover:border-blue-300 transition-colors">
                    {staff.photoUrl ? (
                      <img src={staff.photoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {staff.name}
                    </h3>
                    <p className="text-xs text-gray-500 capitalize">{staff.roleTitle?.replace(/_/g, " ")}</p>
                  </div>
                </Link>
                <StatusBadge status={staff.status} variant="staff" />
              </div>

              {/* Workload Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-medium">Capacity</span>
                  <span className={cn("font-bold", isOverloaded ? "text-red-600" : "text-blue-600")}>
                    {staff.workloadPercentage}%
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isOverloaded ? "bg-red-500" : staff.workloadPercentage > 50 ? "bg-amber-500" : "bg-blue-500"
                    )}
                    style={{ width: `${Math.min(staff.workloadPercentage, 100)}%` }}
                  />
                </div>
                <div className="mt-1 text-[10px] text-gray-400 text-right">
                  {staff.currentWorkload} / {staff.maxWorkload} tasks
                </div>
              </div>
            </div>

            {/* Assignments List */}
            <div className="flex-1 overflow-y-auto p-2 bg-gray-50/50 space-y-2">
               {staff.assignments.length === 0 ? (
                 <div className="h-full flex items-center justify-center text-xs text-gray-400 italic">
                   No active assignments
                 </div>
               ) : (
                 staff.assignments.map(assignment => (
                   <div key={assignment.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm group">
                     <div className="flex justify-between items-start mb-1">
                       <div className="flex items-center gap-2">
                         <span className={cn(
                           "text-[10px] px-1.5 py-0.5 rounded font-mono",
                           assignment.type === 'complaint' ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                         )}>
                           {assignment.label}
                         </span>
                         <PriorityIndicator priority={assignment.priority} size="sm" showLabel={false} />
                       </div>
                       
                       {/* Dropdown - Render only on client to match IDs */}
                       {isMounted && (
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded">
                               <MoreHorizontal className="h-4 w-4" />
                             </button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end" className="w-56">
                             <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Move to...</div>
                             {staffCards.filter(s => s.staffId !== staff.staffId).map(target => (
                               <DropdownMenuItem 
                                 key={target.staffId}
                                 onClick={() => handleReassignClick(assignment.id, assignment.type, target.staffId)}
                                 className="text-xs cursor-pointer"
                               >
                                 <div className="flex items-center justify-between w-full">
                                   <span>{target.name}</span>
                                   <span className={cn(
                                     "ml-2 text-[10px] px-1.5 py-0.5 rounded-full",
                                     target.workloadPercentage > 80 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                                   )}>
                                     {target.workloadPercentage}%
                                   </span>
                                 </div>
                               </DropdownMenuItem>
                             ))}
                           </DropdownMenuContent>
                         </DropdownMenu>
                       )}
                     </div>
                     
                     <p className="text-xs font-medium text-gray-900 truncate">{assignment.title}</p>
                     
                     <div className="mt-2 flex justify-between items-center text-[10px] text-gray-500">
                       <span className="capitalize">{assignment.status?.replace(/_/g, ' ')}</span>
                       {assignment.deadline && (
                         <span className="text-amber-600 font-medium">
                           {/* FIX: Use date-fns for consistent hydration */}
                           Due: {format(new Date(assignment.deadline), "MMM d, yyyy")}
                         </span>
                       )}
                     </div>
                   </div>
                 ))
               )}
            </div>

            {/* Footer Actions */}
            <div className="p-3 border-t border-gray-200 grid grid-cols-2 gap-2 bg-white rounded-b-xl">
               <button 
                 onClick={() => onMessage(staff.staffId)}
                 className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
               >
                 <MessageSquare className="h-3.5 w-3.5" /> Message
               </button>
               <Link 
                 href={`/supervisor/staff/${staff.staffId}`}
                 className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
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