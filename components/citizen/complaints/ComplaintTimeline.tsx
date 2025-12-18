"use client";

import { ComplaintStatusBadge } from "./ComplaintStatusBadge";
import type { ComplaintStatusHistoryItem } from "@/lib/types/complaints";
import { User, Calendar } from "lucide-react";

interface ComplaintTimelineProps {
  timeline: ComplaintStatusHistoryItem[];
}

export function ComplaintTimeline({ timeline }: ComplaintTimelineProps) {
  return (
    <div className="flow-root">
      <ul className="space-y-6">
        {timeline.map((item, itemIdx) => (
          <li
            key={item.id}
            className="relative animate-slide-up"
            style={{ animationDelay: `${itemIdx * 100}ms` }}
          >
            <div className="relative flex gap-4">
              {/* Timeline Line */}
              {itemIdx !== timeline.length - 1 && (
                <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-linear-to-b from-blue-400 to-purple-400 opacity-30"></div>
              )}

              {/* Status Circle */}
              <div className="relative flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg ring-4 ring-white group-hover:scale-110 transition-transform">
                  <span className="text-white text-sm font-bold">
                    {itemIdx + 1}
                  </span>
                </div>
                {itemIdx === 0 && (
                  <div className="absolute inset-0 rounded-full bg-linear-to-br from-blue-500 to-purple-600 blur-xl opacity-40 animate-pulse"></div>
                )}
              </div>

              {/* Content Card */}
              <div className="flex-1 min-w-0 pb-6">
                <div className="glass rounded-xl p-4 border border-slate-200 hover:shadow-lg transition-all duration-300 group">
                  {/* Status Change */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-slate-600">
                      Status changed from
                    </span>
                    {item.old_status ? (
                      <ComplaintStatusBadge
                        status={item.old_status as any}
                        size="sm"
                      />
                    ) : (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-full">
                        None
                      </span>
                    )}
                    <span className="text-sm font-medium text-slate-600">
                      to
                    </span>
                    <ComplaintStatusBadge
                      status={item.new_status as any}
                      size="sm"
                    />
                  </div>

                  {/* Note */}
                  {item.note && (
                    <div className="mb-3 p-3 bg-linear-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                      <p className="text-sm text-slate-800 leading-relaxed">
                        {item.note}
                      </p>
                    </div>
                  )}

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span className="font-medium">
                        {item.changed_by?.user_profiles?.full_name ||
                          item.changed_by?.email ||
                          "System"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(item.changed_at).toLocaleDateString()} at{" "}
                        {new Date(item.changed_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
