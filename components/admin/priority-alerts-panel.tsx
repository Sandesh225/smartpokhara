"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowRight, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PriorityAlert } from "@/lib/types/admin";

interface PriorityAlertsPanelProps {
  alerts: PriorityAlert[];
}

export function PriorityAlertsPanel({ alerts }: PriorityAlertsPanelProps) {
  if (alerts.length === 0) {
    return null;
  }

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "critical":
        return {
          badge:
            "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
          icon: "text-red-600 dark:text-red-400",
        };
      case "high":
        return {
          badge:
            "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800",
          icon: "text-orange-600 dark:text-orange-400",
        };
      default:
        return {
          badge:
            "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
          icon: "text-amber-600 dark:text-amber-400",
        };
    }
  };

  return (
    <Card className="border-red-200 dark:border-red-900/50 bg-linear-to-br from-red-50 to-orange-50/30 dark:from-red-950/30 dark:to-orange-950/10 overflow-hidden">
      <CardHeader className="border-b border-red-100 dark:border-red-900/50 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/40">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-base text-red-900 dark:text-red-100">
                Priority Alerts
                <Badge variant="destructive" className="h-5 px-2 text-[10px]">
                  {alerts.length}
                </Badge>
              </CardTitle>
              <p className="text-xs text-red-700/70 dark:text-red-300/70 mt-0.5">
                Complaints requiring immediate attention
              </p>
            </div>
          </div>
          <Link href="/admin/complaints?overdue=true">
            <Button
              variant="ghost"
              size="sm"
              className="text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 gap-2"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          {alerts.slice(0, 5).map((alert) => {
            const styles = getPriorityStyles(alert.priority);
            return (
              <Link
                key={alert.id}
                href={`/admin/complaints/${alert.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <Badge
                    variant="outline"
                    className={cn(
                      "flex items-center gap-1.5 shrink-0 font-semibold",
                      styles.badge
                    )}
                  >
                    <AlertTriangle className={cn("h-3 w-3", styles.icon)} />
                    {alert.priority.toUpperCase()}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 dark:text-white truncate">
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400 mr-2">
                        {alert.tracking_code}
                      </span>
                      {alert.title}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {alert.assigned_staff_name || "Unassigned"}
                      </span>
                      {alert.department_name && (
                        <span className="text-slate-400 dark:text-slate-500">
                          • {alert.department_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/40 text-xs font-semibold text-red-700 dark:text-red-300">
                    <Clock className="h-3 w-3" />
                    {alert.days_overdue}d overdue
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500 hidden sm:block" />
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
