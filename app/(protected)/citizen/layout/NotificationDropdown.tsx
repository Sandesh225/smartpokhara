"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  FileText,
  CreditCard,
  Megaphone,
  AlertTriangle,
  Info,
  ArrowRight,
  CheckCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type NotificationType =
  | "complaint_status"
  | "bill_generated"
  | "new_notice"
  | "system_announcement"
  | "general";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

interface NotificationDropdownProps {
  userId: string;
  onClose: () => void;
  onCountUpdate: (count: number) => void;
}

export default function NotificationDropdown({
  userId,
  onClose,
  onCountUpdate,
}: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const getIcon = (type: NotificationType) => {
    const icons = {
      complaint_status: (
        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      ),
      bill_generated: (
        <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      ),
      new_notice: (
        <Megaphone className="h-5 w-5 text-amber-600 dark:text-amber-400" />
      ),
      system_announcement: (
        <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
      ),
      general: <Info className="h-5 w-5 text-slate-500 dark:text-slate-400" />,
    };
    return icons[type] || icons.general;
  };

  const fetchNotifications = useCallback(async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setNotifications(data);
      const unread = data.filter((n) => !n.is_read).length;
      onCountUpdate(unread);
    }
    setLoading(false);
  }, [userId, supabase, onCountUpdate]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);

    // Update count based on remaining unread in local state
    const unreadCount = notifications.filter(
      (n) => n.id !== id && !n.is_read
    ).length;
    onCountUpdate(unreadCount);
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", unreadIds);
    onCountUpdate(0);
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/20 dark:bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Dropdown Container */}
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.95 }}
        className="absolute right-0 top-full mt-4 w-[420px] max-w-[calc(100vw-2rem)] bg-popover text-popover-foreground rounded-2xl shadow-2xl border border-border z-50 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </h3>
          </div>
          {notifications.some((n) => !n.is_read) && (
            <button
              onClick={markAllRead}
              className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[480px] overflow-y-auto">
          {loading ? (
            <div className="p-12 flex flex-col items-center gap-3">
              <div className="h-8 w-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-xs text-muted-foreground font-medium">
                Loading...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-10 h-10 text-muted/50 mx-auto mb-3" />
              <p className="font-semibold text-foreground">No new updates</p>
              <p className="text-sm text-muted-foreground">
                We'll let you know when something happens.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              <AnimatePresence mode="popLayout">
                {notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "p-4 transition-colors relative group",
                      !n.is_read
                        ? "bg-primary/[0.03] dark:bg-primary/[0.05]"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex gap-4">
                      {/* Icon with Ring */}
                      <div className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center shrink-0 shadow-sm">
                        {getIcon(n.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4
                            className={cn(
                              "text-sm font-bold truncate",
                              n.is_read
                                ? "text-muted-foreground"
                                : "text-foreground"
                            )}
                          >
                            {n.title}
                          </h4>
                          {!n.is_read && (
                            <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2 leading-snug">
                          {n.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium text-muted-foreground/70 uppercase italic">
                            {formatDistanceToNow(new Date(n.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                          {n.action_url && (
                            <Link
                              href={n.action_url}
                              onClick={onClose}
                              className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                            >
                              Details <ArrowRight className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20">
          <Link
            href="/citizen/notifications"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
          >
            View All
          </Link>
        </div>
      </motion.div>
    </>
  );
}