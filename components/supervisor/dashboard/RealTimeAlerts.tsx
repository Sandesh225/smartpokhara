"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, AlertCircle, X } from "lucide-react";
import { supervisorComplaintsSubscription } from "@/lib/supabase/realtime/supervisor-complaints-subscription";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "unassigned" | "overdue" | "escalation";
  message: string;
  timestamp: string;
  link: string;
}

const alertConfig = {
  unassigned: {
    icon: AlertCircle,
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
  overdue: {
    icon: Clock,
    color: "text-red-600",
    bg: "bg-red-100",
  },
  escalation: {
    icon: AlertTriangle,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
};

export function RealTimeAlerts({ initialAlerts = [] }: { initialAlerts?: Alert[] }) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Safety check for the method availability
    if (typeof supervisorComplaintsSubscription.subscribeToUnassignedQueue !== "function") {
      console.warn("Realtime subscription method not available yet.");
      return;
    }

    const channel = supervisorComplaintsSubscription.subscribeToUnassignedQueue(
      // On Insert (New Complaint)
      (complaint) => {
        const newAlert: Alert = {
          id: complaint.id,
          type: "unassigned",
          message: `New unassigned complaint: ${complaint.tracking_code}`,
          timestamp: new Date().toISOString(),
          link: `/supervisor/complaints/${complaint.id}`,
        };
        setAlerts((prev) => [newAlert, ...prev].slice(0, 10)); // Keep max 10
      },
      // On Remove (Assigned)
      (complaintId) => {
        setAlerts((prev) => prev.filter((a) => a.id !== complaintId));
      }
    );

    return () => {
      if (supervisorComplaintsSubscription.unsubscribe) {
        supervisorComplaintsSubscription.unsubscribe(channel);
      }
    };
  }, []);

  const handleDismiss = (alertId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDismissedAlerts((prev) => new Set(prev).add(alertId));
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    }, 300);
  };

  const visibleAlerts = alerts.filter((a) => !dismissedAlerts.has(a.id));

  if (visibleAlerts.length === 0) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-200 shadow-sm p-8 h-full flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">All Clear!</h3>
        <p className="text-sm text-gray-600">No urgent alerts at the moment.</p>
        <p className="text-xs text-gray-500 mt-1">You're doing great! 🎉</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Action Required
          </h3>
          <span className="h-7 w-7 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center shadow-sm animate-pulse">
            {visibleAlerts.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {visibleAlerts.map((alert, index) => {
          const config = alertConfig[alert.type];
          const Icon = config.icon;

          return (
            <Link
              key={alert.id}
              href={alert.link}
              className={cn(
                "block px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition-all group relative",
                dismissedAlerts.has(alert.id) && "opacity-0 translate-x-full"
              )}
              style={{
                animation: `slideIn 0.3s ease-out ${index * 0.05}s both`,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-1 h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform",
                    config.bg,
                    config.color
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => handleDismiss(alert.id, e)}
                    className="h-6 w-6 rounded-md hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
                    title="Dismiss"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}