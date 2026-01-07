"use client";

import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  MessageSquare,
  UserCircle2,
  ArrowRightCircle,
  AlertCircle,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ComplaintTimeline({ timeline }: { timeline: any[] }) {
  // Helper to determine icon and color based on event type
  const getEventConfig = (event: any) => {
    if (event.new_status === "resolved")
      return {
        icon: CheckCircle2,
        color: "text-emerald-500",
        bg: "bg-emerald-50",
      };
    if (event.new_status === "rejected")
      return { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" };
    if (event.note)
      return { icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-50" };
    return {
      icon: ArrowRightCircle,
      color: "text-slate-400",
      bg: "bg-slate-50",
    };
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
      {/* Compact Sticky Header */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <History className="w-3.5 h-3.5" />
          Audit Trail
        </h3>
        <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
          {timeline.length} Events
        </span>
      </div>

      {/* Scrollable Timeline Area */}
      <ScrollArea className="max-h-[380px] px-4 py-4">
        <div className="relative border-l border-slate-200 ml-2.5 space-y-4 pb-2">
          {timeline.map((event: any) => {
            const config = getEventConfig(event);
            return (
              <div
                key={event.id}
                className="relative pl-6 animate-in fade-in slide-in-from-left-2 duration-300"
              >
                {/* Visual Connector Dot/Icon */}
                <div
                  className={cn(
                    "absolute -left-[13px] top-0.5 h-6 w-6 rounded-full border-4 border-white flex items-center justify-center shadow-sm",
                    config.bg
                  )}
                >
                  <config.icon className={cn("w-3 h-3", config.color)} />
                </div>

                <div className="flex flex-col gap-0.5">
                  <p className="text-xs font-bold text-slate-900 leading-snug">
                    {event.note || (
                      <span>
                        Status updated to{" "}
                        <span className="text-primary font-black uppercase text-[10px]">
                          {event.new_status?.replace("_", " ")}
                        </span>
                      </span>
                    )}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <UserCircle2 className="w-3 h-3" />
                      {event.actor?.profile?.full_name || "System"}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>
                      {formatDistanceToNow(new Date(event.created_at))} ago
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {timeline.length === 0 && (
            <div className="pl-6 text-[11px] font-medium text-slate-400 italic">
              No activity recorded yet.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
