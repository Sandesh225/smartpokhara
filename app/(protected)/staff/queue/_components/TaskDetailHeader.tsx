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
    <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-4 sm:px-6 shadow-sm">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start gap-4">
          <Link 
            href={backHref}
            className="mt-1 p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
               <div className="flex items-center gap-2">
                 <h1 className="text-xl font-bold text-gray-900">{trackingId}</h1>
                 <span className={`text-xs uppercase font-bold px-1.5 py-0.5 rounded ${isComplaint ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                   {isComplaint ? 'Complaint' : 'Task'}
                 </span>
               </div>
               <PriorityIndicator priority={priority} />
            </div>
            <h2 className="text-sm text-gray-600 font-medium line-clamp-1 mb-2">{title}</h2>
            <StatusBadge status={status} />
          </div>
        </div>
      </div>
    </div>
  );
}