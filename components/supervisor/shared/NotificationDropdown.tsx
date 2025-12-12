"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, AlertTriangle, Info, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SupervisorNotification } from "@/lib/types/supervisor.types";

interface NotificationDropdownProps {
  notifications: SupervisorNotification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  isOpen: boolean;
}

export function NotificationDropdown({
  notifications,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  isOpen,
}: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = (type: string, priority: string) => {
    if (priority === "urgent" || priority === "critical") return <AlertTriangle className="h-4 w-4 text-red-600" />;
    if (priority === "high") return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    if (type === "success") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    return <Info className="h-4 w-4 text-blue-500" />;
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="absolute right-0 top-12 z-50 mt-2 w-80 sm:w-96 origin-top-right overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          <button
            onClick={onMarkAllAsRead}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline disabled:opacity-50"
            disabled={notifications.length === 0}
          >
            Mark all read
          </button>
        </div>

        {/* List */}
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <CheckCircle2 className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900">All caught up!</p>
              <p className="text-xs text-gray-500 mt-1">No new notifications for you.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={cn(
                    "relative group transition-colors hover:bg-gray-50",
                    !notification.is_read ? "bg-blue-50/40" : "bg-white"
                  )}
                >
                  <div className="flex gap-3 p-4">
                    {/* Icon */}
                    <div className="mt-0.5 shrink-0">
                      {getIcon(notification.type, notification.priority)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={notification.action_url || "#"}
                        onClick={() => {
                          onMarkAsRead(notification.id);
                          onClose();
                        }}
                        className="block focus:outline-none"
                      >
                        <p className={cn("text-sm text-gray-900 mb-0.5", !notification.is_read && "font-semibold")}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(notification.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </Link>
                    </div>

                    {/* Actions */}
                    {!notification.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(notification.id);
                        }}
                        className="absolute right-2 top-2 p-1.5 rounded-full text-blue-600 opacity-0 group-hover:opacity-100 hover:bg-blue-100 transition-all"
                        title="Mark as read"
                      >
                        <span className="sr-only">Mark read</span>
                        <div className="h-2 w-2 rounded-full bg-current" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50 p-2">
          <Link
            href="/supervisor/notifications"
            onClick={onClose}
            className="flex items-center justify-center w-full rounded-lg py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            View all notifications
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}