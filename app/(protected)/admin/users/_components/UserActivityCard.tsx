"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Activity, 
  Clock, 
  ShieldAlert, 
  CheckCircle2,
  AlertCircle,
  MapPin 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ActivityLog {
  id: string;
  action: string;
  created_at: string;
  ip_address: string | null;
  success: boolean;
}

export function UserActivityCard({ userId }: { userId: string }) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchActivity() {
      const { data } = await supabase
        .from("session_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) setLogs(data);
      setLoading(false);
    }
    fetchActivity();
  }, [userId, supabase]);

  const getActionIcon = (action: string, success: boolean) => {
    if (!success) {
      return <ShieldAlert className="w-4 h-4 text-error-red" />;
    }
    
    if (action.includes("login")) {
      return <CheckCircle2 className="w-4 h-4 text-success-green" />;
    }
    
    return <Clock className="w-4 h-4 text-info-blue" />;
  };

  return (
    <div className="stone-card overflow-hidden h-auto">
      {/* HEADER */}
      <CardHeader className="border-b-2 border-border bg-muted/30 p-2 md:p-4  ">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <CardTitle className="text-base md:text-lg font-black text-foreground tracking-tight">
            Recent Activity
          </CardTitle>
        </div>
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="p-4 md:p-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="h-16 animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-8 md:py-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-muted mb-3 md:mb-4">
              <Activity className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
            </div>
            <p className="text-sm md:text-base text-muted-foreground font-medium">
              No recent activity recorded.
            </p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between gap-3 p-3 md:p-4 rounded-lg border-2 border-border hover:bg-accent/30 transition-all duration-200 hover:shadow-md group"
              >
                <div className="flex gap-3 flex-1">
                  {/* ICON */}
                  <div className={cn(
                    "mt-0.5 flex h-8 w-8 md:h-10 md:w-10 flex-shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
                    log.success 
                      ? "bg-success-green/10" 
                      : "bg-error-red/10"
                  )}>
                    {getActionIcon(log.action, log.success)}
                  </div>

                  {/* DETAILS */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-base font-black text-foreground capitalize">
                      {log.action.replace(/_/g, " ")}
                    </p>
                    
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <p className="text-[10px] md:text-xs text-muted-foreground font-medium font-mono truncate">
                        {log.ip_address || "Unknown IP"}
                      </p>
                    </div>

                    {/* STATUS BADGE */}
                    <div className="mt-2">
                      <span className={cn(
                        "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md",
                        log.success
                          ? "bg-success-green/10 text-success-green border border-success-green/20"
                          : "bg-error-red/10 text-error-red border border-error-red/20"
                      )}>
                        {log.success ? (
                          <>
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Success
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-2.5 h-2.5" />
                            Failed
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* TIMESTAMP */}
                <div className="flex items-center gap-1 text-right flex-shrink-0">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] md:text-xs text-muted-foreground font-medium whitespace-nowrap">
                    {formatDistanceToNow(new Date(log.created_at), { 
                      addSuffix: true 
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </div>
  );
}