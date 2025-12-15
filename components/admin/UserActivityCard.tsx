"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, ShieldAlert } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-gray-500" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-gray-500">No recent activity recorded.</p>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex gap-3">
                  <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${
                    log.success ? "bg-green-100" : "bg-red-100"
                  }`}>
                    {log.success ? (
                      <Clock className="h-4 w-4 text-green-600" />
                    ) : (
                      <ShieldAlert className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {log.action.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-gray-500">
                      IP: {log.ip_address || "Unknown"}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}