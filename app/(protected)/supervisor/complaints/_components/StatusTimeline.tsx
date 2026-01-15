"use client";

import {
  CheckCircle,
  Circle,
  Clock,
  User,
  AlertCircle,
  ArrowDown,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TimelineEvent {
  id: string;
  new_status: string;
  old_status: string | null;
  created_at: string;
  note: string;
  changed_by: string;
}

interface StatusTimelineProps {
  history: TimelineEvent[];
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  new: {
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    icon: <Circle className="h-3 w-3" />,
  },
  in_progress: {
    color: "text-highlight-tech bg-highlight-tech/10 border-highlight-tech/20",
    icon: <Clock className="h-3 w-3" />,
  },
  pending: {
    color: "text-purple-500 bg-purple-500/10 border-purple-200",
    icon: <AlertCircle className="h-3 w-3" />,
  },
  resolved: {
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    icon: <CheckCircle className="h-3 w-3" />,
  },
  closed: {
    color: "text-slate-500 bg-slate-500/10 border-slate-500/20",
    icon: <CheckCircle className="h-3 w-3" />,
  },
  reopened: {
    color: "text-warning-amber bg-warning-amber/10 border-warning-amber/20",
    icon: <AlertCircle className="h-3 w-3" />,
  },
};

export function StatusTimeline({ history }: StatusTimelineProps) {
  const sortedHistory = [...history].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const formatStatus = (s: string) => s.replace("_", " ").toUpperCase();

  return (
    <div className="stone-card dark:stone-card-elevated border-none overflow-hidden shadow-2xl transition-colors-smooth">
      <CardHeader className="bg-primary/5 dark:bg-dark-surface/40 border-b border-primary/10 py-5">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground dark:text-glow">
                Lifecycle Log
              </span>
              <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">
                Full Chain of Custody
              </p>
            </div>
          </CardTitle>
          {sortedHistory.length > 0 && (
            <Badge
              variant="outline"
              className="text-[9px] font-black uppercase tracking-tighter border-primary/20 bg-primary/5"
            >
              {sortedHistory.length} Transitions
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-8">
        {sortedHistory.length === 0 ? (
          <div className="text-center py-12 glass border-2 border-dashed border-primary/10 rounded-3xl opacity-50">
            <Clock className="h-10 w-10 mx-auto text-primary/30 mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Waiting for initial event...
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* 🛤️ The Structural Vertical Beam */}
            <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-primary via-primary/20 to-transparent" />

            <div className="space-y-10">
              {sortedHistory.map((event, idx) => {
                const config = statusConfig[event.new_status] || {
                  color: "text-gray-500",
                  icon: <Circle />,
                };
                const isLatest = idx === 0;

                return (
                  <div key={event.id} className="relative pl-12 group">
                    {/* ⚙️ Timeline Node */}
                    <div
                      className={cn(
                        "absolute left-0 top-1 h-8 w-8 rounded-xl border-2 flex items-center justify-center transition-all duration-500 z-10",
                        isLatest
                          ? "bg-background border-primary shadow-[0_0_15px_rgba(var(--primary-brand),0.4)] scale-110"
                          : "bg-muted/50 border-muted-foreground/20 group-hover:border-primary/40"
                      )}
                    >
                      {isLatest ? (
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      ) : (
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Badge
                            className={cn(
                              "px-3 py-1 font-black text-[10px] tracking-widest border-none shadow-sm",
                              config.color
                            )}
                          >
                            {formatStatus(event.new_status)}
                          </Badge>

                          {event.old_status && (
                            <>
                              <ArrowDown className="h-3 w-3 text-muted-foreground/40 -rotate-90" />
                              <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest italic">
                                From {formatStatus(event.old_status)}
                              </span>
                            </>
                          )}
                        </div>

                        <time className="text-[10px] font-mono font-bold text-muted-foreground/60 bg-muted/30 px-2 py-1 rounded-md">
                          {format(
                            new Date(event.created_at),
                            "HH:mm • MMM d, yyyy"
                          )}
                        </time>
                      </div>

                      <div
                        className={cn(
                          "rounded-2xl p-4 transition-all duration-300 border",
                          isLatest
                            ? "glass border-primary/20 shadow-lg"
                            : "bg-muted/10 border-transparent hover:bg-muted/20"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-3 w-3 text-primary" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-foreground/80">
                            Authorized By: {event.changed_by || "System Core"}
                          </span>
                        </div>

                        {event.note ? (
                          <p className="text-sm leading-relaxed text-foreground/90 font-medium whitespace-pre-wrap pl-5 border-l-2 border-primary/10">
                            {event.note}
                          </p>
                        ) : (
                          <p className="text-[10px] italic text-muted-foreground">
                            Automated status transition recorded.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>

      {/* Decorative footer line */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
    </div>
  );
}
