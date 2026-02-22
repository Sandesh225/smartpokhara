"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  FileText,
  CreditCard,
  Megaphone,
  AlertTriangle,
  Info,
  ArrowRight,
  CheckCheck,
  X,
  Sparkles,
  Clock,
  CheckCircle2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export type NotificationType =
  | "complaint_status"
  | "bill_generated"
  | "new_notice"
  | "system_announcement"
  | "task_assigned"
  | "general";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
  metadata?: any;
}

interface NotificationDropdownProps {
  userId: string;
  onClose: () => void;
  onCountUpdate?: (count: number) => void;
  isOpen: boolean;
  portal?: 'admin' | 'citizen' | 'staff' | 'supervisor';
}

export function NotificationDropdown({
  userId,
  onClose,
  onCountUpdate,
  isOpen,
  portal = 'citizen'
}: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const getIcon = (type: string) => {
    const iconMap: Record<string, { icon: any, className: string }> = {
      complaint_status: {
        icon: FileText,
        className: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/50",
      },
      task_assigned: {
        icon: CheckCircle2,
        className: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/50",
      },
      bill_generated: {
        icon: CreditCard,
        className: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50",
      },
      new_notice: {
        icon: Megaphone,
        className: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/50",
      },
      system_announcement: {
        icon: AlertTriangle,
        className: "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/50",
      },
      general: {
        icon: Info,
        className: "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950/50",
      },
    };

    const config = iconMap[type] || iconMap.general;
    const Icon = config.icon;

    return (
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", config.className)}>
        <Icon className="h-5 w-5" />
      </div>
    );
  };

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setNotifications(data);
      const unread = data.filter((n) => !n.is_read).length;
      onCountUpdate?.(unread);
    }
    setLoading(false);
  }, [userId, supabase, onCountUpdate]);

  useEffect(() => {
    if (isOpen) {
        fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const markRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);

    const unreadCount = notifications.filter(
      (n) => n.id !== id && !n.is_read
    ).length;
    onCountUpdate?.(unreadCount);
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", unreadIds);
    onCountUpdate?.(0);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute right-0 top-full mt-4 w-[440px] max-w-[calc(100vw-2rem)] bg-card border-2 border-border rounded-3xl shadow-2xl z-50 overflow-hidden"
      >
        <div className="p-6 border-b-2 border-border flex items-center justify-between bg-gradient-to-br from-muted/30 to-transparent">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground">
                Notifications
              </h3>
              <p className="text-xs text-muted-foreground font-semibold">
                {notifications.filter((n) => !n.is_read).length} unread
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notifications.some((n) => !n.is_read) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={markAllRead}
                className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-primary/10 transition-all"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="h-8 w-8 rounded-xl hover:bg-muted flex items-center justify-center transition-all"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </motion.button>
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="p-12 flex flex-col items-center gap-4">
              <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground font-semibold">
                Loading notifications...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center"
            >
              <div className="h-16 w-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
                <Bell className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h4 className="font-black text-lg text-foreground mb-2">
                No notifications
              </h4>
              <p className="text-sm text-muted-foreground font-medium">
                We'll notify you when something important happens
              </p>
            </motion.div>
          ) : (
            <div className="divide-y-2 divide-border">
              {notifications.map((n, index) => (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  onClick={() => !n.is_read && markRead(n.id)}
                  className={cn(
                    "p-5 transition-all cursor-pointer group relative",
                    !n.is_read
                      ? "bg-primary/[0.04] dark:bg-primary/[0.06] hover:bg-primary/[0.08] dark:hover:bg-primary/[0.10]"
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex gap-4">
                    {getIcon(n.type)}

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <h4
                          className={cn(
                            "text-sm font-bold leading-tight",
                            n.is_read
                              ? "text-muted-foreground"
                              : "text-foreground"
                          )}
                        >
                          {n.title}
                        </h4>
                        {!n.is_read && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0 mt-1"
                          />
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed font-medium">
                        {n.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-muted-foreground/70 uppercase tracking-wide flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(n.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                        {(n.action_url || n.metadata?.link) && (
                          <Link
                            href={n.action_url || n.metadata?.link}
                            onClick={onClose}
                            className="text-xs font-bold text-primary flex items-center gap-1.5 hover:gap-2 transition-all px-3 py-1.5 rounded-lg hover:bg-primary/10"
                          >
                            View Details
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t-2 border-border bg-gradient-to-br from-muted/20 to-transparent">
          <Link
            href={`/${portal}/notifications`}
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-primary to-primary-brand text-white text-sm font-black hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            <Sparkles className="h-4 w-4" />
            View All Notifications
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}