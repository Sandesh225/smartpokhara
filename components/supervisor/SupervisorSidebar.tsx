"use client";

import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  ClipboardList,
  BarChart2,
  FileBarChart,
  MessageSquare,
  Calendar,
  Settings,
  LogOut,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type SupervisorMenuItem = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  badgeKey?: "unassigned" | "overdue" | "messages";
  exact?: boolean;
  submenu?: {
    href: string;
    label: string;
    badgeKey?: "unassigned" | "overdue";
  }[];
};

const MENU_ITEMS: SupervisorMenuItem[] = [
  {
    href: "/supervisor/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/supervisor/complaints",
    label: "Complaints",
    icon: FileText,
    submenu: [
      { href: "/supervisor/complaints", label: "All Complaints" },
      {
        href: "/supervisor/complaints/unassigned",
        label: "Unassigned Queue",
        badgeKey: "unassigned",
      },
      {
        href: "/supervisor/complaints/overdue",
        label: "Overdue / Risk",
        badgeKey: "overdue",
      },
    ],
  },
  { href: "/supervisor/staff", label: "Staff & Workload", icon: Users },
  { href: "/supervisor/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/supervisor/analytics", label: "Analytics", icon: BarChart2 },
  {
    href: "/supervisor/messages",
    label: "Messages",
    icon: MessageSquare,
    badgeKey: "messages",
  },
  { href: "/supervisor/reports", label: "Reports", icon: FileBarChart },
  { href: "/supervisor/calendar", label: "Calendar", icon: Calendar },
];

interface SupervisorSidebarProps {
  badgeCounts: {
    unassigned: number;
    overdue: number;
    notifications: number;
    messages: number;
  };
  onLogout: () => Promise<void>;
  isLoggingOut: boolean;
  onNavigate?: () => void;
}

export function SupervisorSidebar({
  badgeCounts,
  onLogout,
  isLoggingOut,
  onNavigate,
}: SupervisorSidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    "/supervisor/complaints": true,
  });

  const toggleMenu = (href: string) => {
    setOpenMenus((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  const handleLinkClick = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-white to-gray-50/30">
      {/* Desktop Header */}
      <div className="hidden lg:flex h-16 items-center px-6 border-b border-gray-200/60 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-600/20 ring-2 ring-blue-100">
            SP
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-none tracking-tight">
              Smart Pokhara
            </h1>
            <p className="text-[10px] font-semibold text-blue-600 mt-0.5 uppercase tracking-wider">
              Supervisor Portal
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-6 space-y-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        <p className="px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
          Main Menu
        </p>

        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          const mainBadge = item.badgeKey ? badgeCounts[item.badgeKey] : 0;
          const hasSubmenu = !!item.submenu;
          const isOpen = openMenus[item.href];
          const isUrgent =
            item.badgeKey === "overdue" || item.badgeKey === "unassigned";

          return (
            <div key={item.href} className="space-y-0.5">
              {hasSubmenu ? (
                // Collapsible Menu Item
                <button
                  type="button"
                  onClick={() => toggleMenu(item.href)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                    isActive
                      ? "text-blue-700 bg-gradient-to-r from-blue-50 to-blue-50/50 shadow-sm"
                      : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-500 rounded-r-full" />
                  )}
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-all duration-200",
                        isActive
                          ? "text-blue-600 scale-110"
                          : "text-gray-400 group-hover:text-gray-600 group-hover:scale-105"
                      )}
                    />
                    <span className={cn(isActive && "font-semibold")}>
                      {item.label}
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-gray-400 transition-all duration-200",
                      isOpen && "rotate-180 text-blue-600"
                    )}
                    aria-hidden="true"
                  />
                </button>
              ) : (
                // Direct Link
                <Link
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25"
                      : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                  )}
                  <div className="flex items-center gap-3 relative z-10">
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-all duration-200",
                        isActive
                          ? "text-white drop-shadow-sm"
                          : "text-gray-400 group-hover:text-gray-600 group-hover:scale-105"
                      )}
                    />
                    <span className={cn(isActive && "font-semibold")}>
                      {item.label}
                    </span>
                  </div>
                  {mainBadge > 0 && (
                    <span
                      className={cn(
                        "relative z-10 px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums transition-all duration-200",
                        isActive
                          ? "bg-white/25 text-white shadow-inner"
                          : isUrgent
                          ? "bg-red-500 text-white shadow-md shadow-red-500/30 animate-pulse"
                          : "bg-blue-100 text-blue-700"
                      )}
                    >
                      {mainBadge > 99 ? "99+" : mainBadge}
                    </span>
                  )}
                </Link>
              )}

              {/* Submenu Items */}
              <AnimatePresence initial={false}>
                {hasSubmenu && isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pl-5 pr-2 space-y-0.5 mt-1 ml-4 relative">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 to-transparent rounded-full" />
                      {item.submenu!.map((sub) => {
                        const isSubActive = pathname === sub.href;
                        const subBadge = sub.badgeKey
                          ? badgeCounts[sub.badgeKey]
                          : 0;
                        const isSubUrgent =
                          sub.badgeKey === "overdue" ||
                          sub.badgeKey === "unassigned";

                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={handleLinkClick}
                            className={cn(
                              "flex items-center justify-between pl-4 pr-3 py-2 rounded-lg text-sm transition-all duration-200 group relative",
                              isSubActive
                                ? "text-blue-700 font-semibold bg-blue-50 shadow-sm"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            )}
                            aria-current={isSubActive ? "page" : undefined}
                          >
                            {isSubActive && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 rounded-r-full" />
                            )}
                            <span className="relative z-10">{sub.label}</span>
                            {subBadge > 0 && (
                              <span
                                className={cn(
                                  "px-1.5 py-0.5 text-[10px] font-bold rounded-md tabular-nums transition-all",
                                  isSubUrgent
                                    ? "bg-red-500 text-white shadow-md shadow-red-500/30 animate-pulse"
                                    : "bg-blue-100 text-blue-700"
                                )}
                              >
                                {subBadge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Utilities Section */}
        <div className="pt-6 mt-6 border-t border-gray-200/60">
          <p className="px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
            System
          </p>
          <Link
            href="/supervisor/settings"
            onClick={handleLinkClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
              pathname === "/supervisor/settings"
                ? "bg-gray-100 text-gray-900 shadow-sm"
                : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
            )}
            aria-current={
              pathname === "/supervisor/settings" ? "page" : undefined
            }
          >
            <Settings
              className={cn(
                "h-5 w-5 transition-all duration-200",
                pathname === "/supervisor/settings"
                  ? "text-gray-700"
                  : "text-gray-400 group-hover:text-gray-600 group-hover:rotate-45"
              )}
            />
            <span>Settings</span>
          </Link>
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="border-t border-gray-200/60 p-4 bg-gradient-to-t from-gray-50/80 to-white/50 backdrop-blur-sm">
        <button
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-50/0 via-red-50/50 to-red-50/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          {isLoggingOut ? (
            <Loader2 className="h-5 w-5 animate-spin text-red-600 relative z-10" />
          ) : (
            <LogOut className="h-5 w-5 text-red-500 group-hover:text-red-600 transition-colors relative z-10" />
          )}
          <span className="relative z-10">
            {isLoggingOut ? "Signing out..." : "Sign Out"}
          </span>
        </button>
      </div>
    </div>
  );
}
