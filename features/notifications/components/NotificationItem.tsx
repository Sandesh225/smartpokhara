"use client";

import React from "react";
import { motion } from "framer-motion";
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
      return <FileText className="h-5 w-5 text-blue-500" />;
    case "bill_generated":
      return <CreditCard className="h-5 w-5 text-emerald-500" />;
    case "new_notice":
      return <Megaphone className="h-5 w-5 text-amber-500" />;
    case "system_announcement":
      return <AlertTriangle className="h-5 w-5 text-rose-500" />;
    default:
      return <Info className="h-5 w-5 text-slate-400" />;
  }
};

const priorityBadgeClass = {
  low: "bg-slate-100 text-slate-600 border-slate-200",
  normal: "bg-blue-50 text-blue-700 border-blue-100",
  high: "bg-orange-50 text-orange-700 border-orange-100",
  urgent: "bg-red-50 text-red-700 border-red-100",
};

export function NotificationItem({ notification, isSelected, onSelect }: NotificationItemProps) {
  const n = notification;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01, x: 4 }}
      className={cn(
        "group relative flex items-start gap-5 p-6 rounded-[2rem] border transition-all duration-300",
        !n.is_read
          ? "bg-white border-blue-200 shadow-xl shadow-blue-900/5 ring-1 ring-blue-50"
          : "bg-slate-50/50 border-slate-200 opacity-75"
      )}
    >
      <div className="pt-1">
        <input
          type="checkbox"
          className="h-6 w-6 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
          checked={isSelected}
          onChange={() => onSelect(n.id)}
        />
      </div>

      <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-inner">
        {getNotificationIcon(n.type)}
      </div>

      <div className="flex-1 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <h3
              className={cn(
                "text-xl font-black tracking-tight",
                !n.is_read ? "text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-400"
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
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
            )}
          </div>
          <time className="text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
            {format(new Date(n.created_at), "MMM d, yyyy • h:mm a")}
          </time>
        </div>

        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
          {n.message}
        </p>

        {n.action_url && (
          <div className="pt-2">
            <Button
              variant="outline"
              className="rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all group/btn bg-transparent border-2"
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
    </motion.div>
  );
}
