"use client";
import { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
import { staffNotificationsSubscription } from "@/lib/supabase/realtime/staff-notifications-subscription";

export function RealTimeAlerts({ userId }: { userId: string }) {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const channel = staffNotificationsSubscription.subscribeToStaffNotifications(userId, (newAlert) => {
      setAlerts(prev => [newAlert, ...prev]);
    });
    return () => { staffNotificationsSubscription.unsubscribe(channel); };
  }, [userId]);

  if (alerts.length === 0) return null;

  return (
    <div className="mb-6 space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-gray-500 uppercase">Live Alerts</h3>
        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold animate-pulse">
          {alerts.length} NEW
        </span>
      </div>
      {alerts.map((alert, i) => (
        <div key={i} className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-800 animate-in slide-in-from-top-2 fade-in">
           <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
           <div className="flex-1">
             <p className="font-medium">{alert.title}</p>
             <p className="text-xs text-red-600/80 mt-0.5">{alert.message}</p>
           </div>
           <button onClick={() => setAlerts(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-700">
             <X className="h-4 w-4" />
           </button>
        </div>
      ))}
    </div>
  );
}