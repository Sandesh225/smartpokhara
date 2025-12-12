"use client";

import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  unreadCount: number;
  isOpen: boolean;
  onClick: () => void;
  urgencyLevel?: "low" | "medium" | "high";
}

export function NotificationBell({
  unreadCount,
  isOpen,
  onClick,
  urgencyLevel = "medium",
}: NotificationBellProps) {
  const badgeColors = {
    low: "bg-blue-600",
    medium: "bg-orange-500",
    high: "bg-red-600",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative rounded-full p-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        isOpen
          ? "bg-blue-50 text-blue-600"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
      )}
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      aria-expanded={isOpen}
    >
      <Bell className="h-5 w-5" />

      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute top-1.5 right-1.5"
          >
            <span
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-white",
                badgeColors[urgencyLevel]
              )}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
            {urgencyLevel === "high" && (
              <span className="absolute -inset-0.5 rounded-full bg-red-500 opacity-25 animate-ping" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}