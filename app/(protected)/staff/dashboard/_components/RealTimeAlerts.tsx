"use client";

import { useState, useEffect } from "react";
import { AlertCircle, X, Bell } from "lucide-react";
import { staffNotificationsSubscription } from "@/lib/supabase/realtime/staff-notifications-subscription";

export function RealTimeAlerts({ userId }: { userId: string }) {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const channel = staffNotificationsSubscription.subscribeToStaffNotifications(userId, (newAlert) => {
      setAlerts(prev => [newAlert, ...prev]);
    });
    return () => { staffNotificationsSubscription.unsubscribe(channel); };
  }, [userId]);

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
      <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30 dark:bg-muted/10">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-primary" />
          Live Alerts
        </h3>
        <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-bold animate-pulse border border-red-200 dark:border-red-500/30">
          {alerts.length} NEW
        </span>
      </div>
      
      <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
        {alerts.map((alert, i) => (
          <div 
            key={i} 
            className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-lg text-sm animate-in slide-in-from-top-2 fade-in"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-red-900 dark:text-red-300">{alert.title}</p>
              <p className="text-xs text-red-700 dark:text-red-400/80 mt-0.5">{alert.message}</p>
            </div>
            <button 
              onClick={() => setAlerts(prev => prev.filter((_, idx) => idx !== i))} 
              className="text-red-400 dark:text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors p-1 rounded hover:bg-red-100 dark:hover:bg-red-500/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}