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
  overdue: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100" },
  escalation: {
    icon: AlertTriangle,
    color: "text-purple-600",
    bg: "bg-purple-100",
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
    let subPromise: any;

    const setupSubscription = async () => {
      subPromise = supervisorComplaintsSubscription.subscribeToUnassignedQueue(
        (complaint) => {
          setAlerts((prev) =>
            [
              {
                id: complaint.id,
                type: "unassigned",
                message: `New unassigned complaint: ${complaint.tracking_code}`,
                timestamp: new Date().toISOString(),
                link: `/supervisor/complaints/${complaint.id}`,
              },
              ...prev,
            ].slice(0, 10)
          );
        },
        (complaintId) => {
          setAlerts((prev) => prev.filter((a) => a.id !== complaintId));
        }
      );
    };

    setupSubscription();

    return () => {
      if (subPromise) {
        // Wait for the promise to resolve before unsubscribing
        subPromise.then((channel: any) => {
          supervisorComplaintsSubscription.unsubscribe(channel);
        });
      }
    };
  }, []);

  const handleDismiss = (alertId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setDismissedAlerts((prev) => new Set(prev).add(alertId));
  };

  const visibleAlerts = alerts.filter((a) => !dismissedAlerts.has(a.id));

  if (visibleAlerts.length === 0) {
    return (
      <div className="bg-green-50 rounded-2xl border border-green-200 p-8 h-full flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">All Clear!</h3>
        <p className="text-sm text-gray-600">
          No urgent alerts for your department.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-red-50">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" /> Action Required
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {visibleAlerts.map((alert) => {
          const config = alertConfig[alert.type];
          const Icon = config.icon;
          return (
            <Link
              key={alert.id}
              href={alert.link}
              className="block px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition-all group relative"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-1 h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    config.bg,
                    config.color
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(alert.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDismiss(alert.id, e)}
                  className="p-1 hover:bg-gray-200 rounded text-gray-400 opacity-0 group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}