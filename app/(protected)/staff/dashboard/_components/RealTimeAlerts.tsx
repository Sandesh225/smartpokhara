"use client";

import { AlertCircle, X, Bell } from "lucide-react";
import { useNotifications, useNotificationRealtime } from "@/features/notifications";

export function RealTimeAlerts({ userId }: { userId: string }) {
  const { data: notifications = [], isLoading } = useNotifications(userId);
  useNotificationRealtime(userId);

  // Filter for urgent/alert-like notifications if needed, 
  // or just show recent ones. 
  const alerts = notifications.slice(0, 5); // Show latest 5 as alerts

  if (isLoading) return <div className="p-6 text-center text-muted-foreground animate-pulse">Monitoring alerts...</div>;

  if (alerts.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-muted dark:bg-muted/50 flex items-center justify-center mb-3">
          <Bell className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">All Clear</h3>
        <p className="text-xs text-muted-foreground mt-1">
          No active alerts at the moment
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between bg-muted/10">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-primary" />
          Live Alerts
        </h3>
        <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-bold animate-pulse border border-destructive/20">
          {alerts.length} NEW
        </span>
      </div>
      
      <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
        {alerts.map((alert, i) => (
          <div 
            key={i} 
            className="flex items-start gap-3 p-3 bg-destructive/5 border border-destructive/10 rounded-lg text-sm animate-in slide-in-from-top-2 fade-in hover:bg-destructive/10 transition-colors"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground">{alert.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}