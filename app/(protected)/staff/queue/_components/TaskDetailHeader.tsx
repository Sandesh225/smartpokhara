"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityIndicator } from "@/components/shared/PriorityIndicator";

interface TaskDetailHeaderProps {
  trackingId: string;
  status: string;
  priority: string;
  title: string;
  isComplaint: boolean;
  backHref: string;
}

export function TaskDetailHeader({ trackingId, status, priority, title, isComplaint, backHref }: TaskDetailHeaderProps) {
  return (
    <div className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-30 px-4 py-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start gap-4">
          <Link 
            href={backHref}
            className="mt-1 p-2 -ml-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-2">
                 <h1 className="text-xl font-black text-foreground tracking-tight">{trackingId}</h1>
                 <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded border ${isComplaint ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-foreground border-border'}`}>
                   {isComplaint ? 'Complaint' : 'Task'}
                 </span>
               </div>
               <PriorityIndicator priority={priority} />
            </div>
            <h2 className="text-sm text-muted-foreground font-semibold line-clamp-1 mb-3">{title}</h2>
            <StatusBadge status={status} />
          </div>
        </div>
      </div>
    </div>
  );
}