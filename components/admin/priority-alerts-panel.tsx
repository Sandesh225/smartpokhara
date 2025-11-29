// components/admin/priority-alerts-panel.tsx
"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowRight } from "lucide-react";
import type { PriorityAlert } from "@/lib/types/admin";

interface PriorityAlertsPanelProps {
  alerts: PriorityAlert[];
}

export function PriorityAlertsPanel({ alerts }: PriorityAlertsPanelProps) {
  if (alerts.length === 0) {
    return null;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base text-red-900">
            <AlertTriangle className="h-5 w-5" />
            Priority Alerts
            <Badge variant="destructive" className="ml-2">
              {alerts.length}
            </Badge>
          </CardTitle>
          <Link href="/admin/complaints?overdue=true">
            <Button variant="ghost" size="sm" className="text-red-700 hover:bg-red-100">
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.slice(0, 5).map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between rounded-lg border bg-white p-3"
            >
              <div className="flex items-start gap-3">
                <Badge 
                  variant="outline" 
                  className={`flex items-center gap-1 ${getPriorityColor(alert.priority)}`}
                >
                  {getPriorityIcon(alert.priority)}
                  {alert.priority.toUpperCase()}
                </Badge>
                <div>
                  <Link 
                    href={`/admin/complaints/${alert.id}`}
                    className="font-medium text-slate-900 hover:text-blue-600 hover:underline"
                  >
                    {alert.tracking_code}: {alert.title}
                  </Link>
                  <div className="mt-1 flex items-center gap-4 text-xs text-slate-500">
                    <span>
                      {alert.assigned_staff_name || 'Unassigned'}
                      {alert.department_name && ` • ${alert.department_name}`}
                    </span>
                    <span className="font-medium text-red-600">
                      {alert.days_overdue} days overdue
                    </span>
                  </div>
                </div>
              </div>
              <Link href={`/admin/complaints/${alert.id}`}>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}