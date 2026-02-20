"use client";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityIndicator } from "@/components/shared/PriorityIndicator";
import { MapPin, Tag } from "lucide-react";

interface ComplaintDetailsHeaderProps {
  complaint: {
    tracking_code: string;
    title: string;
    status: string;
    priority: string;
    category: { name: string; name_nepali?: string } | null;
    subcategory: { name: string; name_nepali?: string } | null;
    ward: { ward_number: number; name: string } | null;
  };
}

export function ComplaintDetailsHeader({
  complaint,
}: ComplaintDetailsHeaderProps) {
  return (
    <div className="glass rounded-2xl shadow-xl p-6 sm:p-8 border border-white/30 overflow-hidden relative">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1 space-y-4">
            {/* Title and Badges */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <StatusBadge
                  status={complaint.status as any}
                  variant="complaint"
                />
                <PriorityIndicator
                  priority={complaint.priority as any}
                />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                {complaint.title}
              </h1>
            </div>

            {/* Tracking Code */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
              <span className="text-sm font-medium text-slate-600">
                Tracking Code:
              </span>
              <code className="text-sm font-bold font-mono text-blue-700">
                {complaint.tracking_code}
              </code>
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap gap-4">
              {complaint.category && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-lg border border-slate-200">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">
                    {complaint.category.name}
                    {complaint.subcategory && (
                      <span className="text-slate-500">
                        {" "}
                        / {complaint.subcategory.name}
                      </span>
                    )}
                  </span>
                </div>
              )}
              {complaint.ward && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-lg border border-slate-200">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-slate-700">
                    Ward {complaint.ward.ward_number} - {complaint.ward.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Status Indicator Circle */}
          <div className="shrink-0">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl animate-pulse-scale">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                  <span className="text-2xl font-bold bg-linear-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {getStatusIcon(complaint.status)}
                  </span>
                </div>
              </div>
              <div className="absolute inset-0 rounded-full bg-linear-to-br from-blue-500 to-purple-600 blur-xl opacity-30 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    draft: "📝",
    received: "📨",
    assigned: "👤",
    in_progress: "⚙️",
    resolved: "✅",
    closed: "🔒",
    rejected: "❌",
    escalated: "🚨",
  };
  return icons[status] || "📋";
}
