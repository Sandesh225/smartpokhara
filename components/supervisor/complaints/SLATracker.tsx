"use client";

import { SLACountdown } from "@/components/supervisor/shared/SLACountdown";
import { format } from "date-fns";
import { AlertCircle } from "lucide-react";

interface SLATrackerProps {
  deadline: string;
  status: string;
  createdAt: string;
}

export function SLATracker({ deadline, status, createdAt }: SLATrackerProps) {
  const isResolved = ["resolved", "closed"].includes(status.toLowerCase());

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-sm font-semibold text-gray-900">SLA Tracking</h3>
      </div>
      <div className="p-4">
        <div className="mb-4">
          <SLACountdown deadline={deadline} status={status} variant="progress" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-gray-100">
          <div>
            <span className="block text-gray-500 mb-0.5">Started</span>
            <span className="font-medium text-gray-900">
              {format(new Date(createdAt), "MMM d, h:mm a")}
            </span>
          </div>
          <div>
            <span className="block text-gray-500 mb-0.5">Deadline</span>
            <span className="font-medium text-gray-900">
              {format(new Date(deadline), "MMM d, h:mm a")}
            </span>
          </div>
        </div>

        {!isResolved && (
          <button className="mt-4 w-full py-2 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors flex items-center justify-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            Request Extension
          </button>
        )}
      </div>
    </div>
  );
}