"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  X,
  FileText,
  CreditCard,
  Megaphone,
  AlertTriangle,
  Info,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
    switch (type) {
      case "complaint_status":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "bill_generated":
        return <CreditCard className="h-4 w-4 text-emerald-500" />;
      case "new_notice":
        return <Megaphone className="h-4 w-4 text-amber-500" />;
      case "system_announcement":
        return <AlertTriangle className="h-4 w-4 text-rose-500" />;
      default:
        return <Info className="h-4 w-4 text-slate-400" />;
    }
  };

  const fetchNotifications = useCallback(async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(8);

    if (!error) {
      setNotifications(data || []);
      const unread = (data || []).filter((n) => !n.is_read).length;
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
    // Refresh count
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
      .eq("user_id", userId);
    onCountUpdate(0);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="absolute right-0 top-full mt-3 w-[400px] bg-white rounded-[2rem] shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col ring-1 ring-slate-900/5"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-black text-slate-900 leading-none">
              Notifications
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Metropolitan Alert Feed
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllRead}
            className="h-8 rounded-xl text-[11px] font-bold hover:bg-blue-50 hover:text-blue-600"
          >
            Mark all read
          </Button>
        </div>

        <div className="max-h-[420px] overflow-y-auto scrollbar-hide">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-400">
                Syncing Registry...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
                <Bell className="w-8 h-8 text-slate-200" />
              </div>
              <p className="text-slate-900 font-bold">Your inbox is clear</p>
              <p className="text-slate-400 text-xs mt-1">
                We'll notify you here for any updates.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    layout
                    className={cn(
                      "p-4 transition-all hover:bg-slate-50 relative group",
                      !n.is_read && "bg-blue-50/30"
                    )}
                  >
                    <div className="flex gap-4">
                      <div className="h-10 w-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className={cn(
                              "text-sm font-bold truncate",
                              n.is_read ? "text-slate-600" : "text-slate-900"
                            )}
                          >
                            {n.title}
                          </h4>
                          {!n.is_read && (
                            <button
                              onClick={() => markRead(n.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:scale-110"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 font-medium leading-relaxed">
                          {n.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {formatDistanceToNow(new Date(n.created_at))} ago
                          </span>
                          {n.action_url && (
                            <Link
                              href={n.action_url}
                              onClick={onClose}
                              className="text-[10px] font-black text-blue-600 hover:underline flex items-center gap-1"
                            >
                              VIEW <ArrowRight className="h-2.5 w-2.5" />
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

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <Link
            href="/citizen/notifications"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-white border border-slate-200 text-xs font-black text-slate-900 hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm"
          >
            SEE ALL MESSAGES
          </Link>
        </div>
      </motion.div>
    </>
  );
}
