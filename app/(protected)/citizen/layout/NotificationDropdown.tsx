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
      complaint_status: <FileText className="h-5 w-5 text-blue-500" />,
      bill_generated: <CreditCard className="h-5 w-5 text-emerald-500" />,
      new_notice: <Megaphone className="h-5 w-5 text-amber-500" />,
      system_announcement: <AlertTriangle className="h-5 w-5 text-rose-500" />,
      general: <Info className="h-5 w-5 text-slate-400" />,
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

    const { data } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", userId)
      .eq("is_read", false);
    onCountUpdate(data?.length || 0);
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
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-background/30 dark:bg-background/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dropdown */}
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute right-0 top-full mt-4 w-[450px] max-w-[calc(100vw-2rem)] bg-card dark:bg-[rgb(26,31,46)] rounded-2xl elevation-3 border-2 border-border z-50 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b-2 border-border flex items-center justify-between bg-gradient-to-r from-muted/40 to-muted/60 dark:from-[rgb(20,26,33)] dark:to-[rgb(22,28,35)]">
          <div>
            <h3 className="text-xl font-bold text-foreground leading-none flex items-center gap-2.5">
              <Bell className="h-6 w-6 text-primary" />
              Notifications
            </h3>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2">
              Stay updated with your services
            </p>
          </div>
          {notifications.some((n) => !n.is_read) && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold text-primary hover:bg-primary/15 dark:hover:bg-primary/20 transition-all duration-200 active:scale-95"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-[520px] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-4">
              <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm font-semibold text-muted-foreground">
                Loading notifications...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-16 text-center">
              <div className="h-24 w-24 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-5 border-2 border-border elevation-1">
                <Bell className="w-12 h-12 text-muted-foreground/30" />
              </div>
              <p className="text-foreground font-bold text-xl mb-2">
                All caught up!
              </p>
              <p className="text-muted-foreground text-base">
                No new notifications at the moment.
              </p>
            </div>
          ) : (
            <div className="divide-y-2 divide-border">
              <AnimatePresence mode="popLayout">
                {notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "p-5 transition-all duration-200 hover:bg-accent/60 relative group cursor-pointer",
                      !n.is_read &&
                        "bg-primary/8 dark:bg-primary/12 border-l-4 border-l-primary"
                    )}
                    onClick={() => !n.is_read && markRead(n.id)}
                  >
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className="h-12 w-12 rounded-xl bg-background dark:bg-card border-2 border-border elevation-1 flex items-center justify-center shrink-0">
                        {getIcon(n.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h4
                            className={cn(
                              "text-base font-bold truncate",
                              n.is_read
                                ? "text-muted-foreground"
                                : "text-foreground"
                            )}
                          >
                            {n.title}
                          </h4>
                          {!n.is_read && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                markRead(n.id);
                              }}
                              className="p-1.5 rounded-lg text-primary hover:bg-primary/15 dark:hover:bg-primary/20 transition-all duration-200"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                          {n.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            {formatDistanceToNow(new Date(n.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                          {n.action_url && (
                            <Link
                              href={n.action_url}
                              onClick={onClose}
                              className="text-sm font-bold text-primary hover:underline flex items-center gap-1.5 group-hover:gap-2 transition-all duration-200"
                            >
                              View Details
                              <ArrowRight className="h-4 w-4" />
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
        <div className="p-5 border-t-2 border-border bg-gradient-to-r from-muted/40 to-muted/60 dark:from-[rgb(20,26,33)] dark:to-[rgb(22,28,35)]">
          <Link
            href="/citizen/notifications"
            onClick={onClose}
            className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-primary/15 hover:bg-primary hover:text-primary-foreground border-2 border-primary/30 hover:border-primary text-base font-bold text-primary transition-all duration-200 active:scale-95 elevation-1"
          >
            View All Notifications
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </motion.div>
    </>
  );
}