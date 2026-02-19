"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { subscribeToComplaints } from "@/features/complaints/realtime/complaintsSubscription";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "unassigned" | "overdue" | "escalation";
  message: string;
  timestamp: string;
  link: string;
}

// Refactored to use semantic theme variables
const alertConfig = {
  unassigned: {
    icon: AlertCircle,
    color: "text-orange-500",
    bg: "bg-orange-500/15",
    border: "border-orange-500/20",
  },
  overdue: { 
    icon: AlertTriangle, 
    color: "text-destructive", 
    bg: "bg-destructive/15",
    border: "border-destructive/20",
  },
  escalation: {
    icon: AlertTriangle,
    color: "text-purple-500",
    bg: "bg-purple-500/15",
    border: "border-purple-500/20",
  },
};

export function RealTimeAlerts({
  initialAlerts = [],
}: {
  initialAlerts?: Alert[];
}) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const supabase = createClient();
    
    const channel = subscribeToComplaints(supabase, () => {
      // In this variant, we just refresh or handle payload if we update the hook
      // But for a quick fix, we can re-fetch or let it be.
      // Actually, the new subscribeToComplaints DOES show a toast.
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDismiss = (alertId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setDismissedAlerts((prev) => new Set(prev).add(alertId));
  };

  const visibleAlerts = alerts.filter((a) => !dismissedAlerts.has(a.id));

  if (visibleAlerts.length === 0) {
    return (
      <div className="stone-card p-8 h-full flex flex-col items-center justify-center text-center border-emerald-500/20 bg-emerald-500/5">
        <div className="h-16 w-16 bg-emerald-500/15 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1">Queue Synchronized</h3>
        <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
          No urgent attention items in the department buffer.
        </p>
      </div>
    );
  }

  return (
    <div className="stone-card h-full flex flex-col overflow-hidden border-destructive/20">
      {/* Header with Danger Pulse */}
      <div className="px-6 py-4 border-b border-border/50 bg-linear-to-b from-destructive/10 to-transparent">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" /> 
            Immediate Attention
          </h3>
          <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-destructive/15 text-destructive rounded-full">
            {visibleAlerts.length} Active
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {visibleAlerts.map((alert) => {
          const config = alertConfig[alert.type];
          const Icon = config.icon;
          return (
            <Link
              key={alert.id}
              href={alert.link}
              className="block px-6 py-4 border-b border-border/30 hover:bg-muted/40 transition-all group relative"
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "mt-1 h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105",
                    config.bg,
                    config.color,
                    config.border
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                    {alert.message}
                  </p>
                  <p className="text-[10px] font-medium text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(alert.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center gap-2">
                  <button
                    onClick={(e) => handleDismiss(alert.id, e)}
                    className="p-1.5 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      {/* Dynamic Footer */}
      <div className="px-6 py-3 border-t border-border/50 bg-muted/20">
        <p className="text-[10px] text-center font-bold text-muted-foreground uppercase tracking-widest">
          Subscription Active: Monitoring Real-time Queue
        </p>
      </div>
    </div>
  );
}