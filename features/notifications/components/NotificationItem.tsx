"use client";

import React from "react";
import { format } from "date-fns";
import {
  FileText,
  CreditCard,
  Megaphone,
  AlertTriangle,
  Info,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type NotificationType =
  | "complaint_status"
  | "bill_generated"
  | "new_notice"
  | "system_announcement"
  | "general";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  complaint_id: string | null;
  bill_id: string | null;
  notice_id: string | null;
  is_read: boolean;
  priority: "low" | "normal" | "high" | "urgent";
  action_url: string | null;
  created_at: string;
};

interface NotificationItemProps {
  notification: Notification;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "complaint_status":
      return <FileText className="h-5 w-5 text-primary" />;
    case "bill_generated":
      return <CreditCard className="h-5 w-5 text-primary" />;
    case "new_notice":
      return <Megaphone className="h-5 w-5 text-accent" />;
    case "system_announcement":
      return <AlertTriangle className="h-5 w-5 text-destructive" />;
    default:
      return <Info className="h-5 w-5 text-muted-foreground" />;
  }
};

const priorityBadgeClass = {
  low: "bg-muted text-muted-foreground border-border",
  normal: "bg-primary/10 text-primary border-primary/20",
  high: "bg-accent/10 text-accent border-accent/20",
  urgent: "bg-destructive/10 text-destructive border-destructive/20",
};

export function NotificationItem({ notification, isSelected, onSelect }: NotificationItemProps) {
  const n = notification;

  return (
    <div
      className={cn(
        "group relative flex items-start gap-5 p-6 rounded-4xl border transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 hover:scale-[1.01] hover:translate-x-1",
        !n.is_read
          ? "bg-card border-primary/20 shadow-xl shadow-primary/5 ring-1 ring-primary/10"
          : "bg-muted/50 border-border opacity-75"
      )}
    >
      <div className="pt-1">
        <input
          type="checkbox"
          className="h-6 w-6 rounded-lg border-border text-primary focus:ring-primary cursor-pointer accent-primary"
          checked={isSelected}
          onChange={() => onSelect(n.id)}
        />
      </div>

      <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center shrink-0 shadow-inner">
        {getNotificationIcon(n.type)}
      </div>

      <div className="flex-1 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <h3
              className={cn(
                "text-xl font-black tracking-tight",
                !n.is_read ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {n.title}
            </h3>
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-black uppercase px-2 rounded-lg border-2",
                priorityBadgeClass[n.priority]
              )}
            >
              {n.priority}
            </Badge>
            {!n.is_read && (
              <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
            )}
          </div>
          <time className="text-xs font-bold text-muted-foreground bg-background border border-border px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
            {format(new Date(n.created_at), "MMM d, yyyy • h:mm a")}
          </time>
        </div>

        <p className="text-muted-foreground text-lg leading-relaxed">
          {n.message}
        </p>

        {n.action_url && (
          <div className="pt-2">
            <Button
              variant="outline"
              className="rounded-xl font-bold hover:bg-primary hover:text-primary-foreground transition-all group/btn bg-transparent border-2"
              asChild
            >
              <a href={n.action_url}>
                View Details{" "}
                <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
