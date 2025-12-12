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
  AlertCircle,
  Clock,
  ChevronDown
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
  submenu?: { href: string; label: string; badgeKey?: "unassigned" | "overdue" }[];
};

const MENU_ITEMS: SupervisorMenuItem[] = [
  { href: "/supervisor/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  {
    href: "/supervisor/complaints",
    label: "Complaints",
    icon: FileText,
    submenu: [
      { href: "/supervisor/complaints", label: "All Complaints" },
      { href: "/supervisor/complaints/unassigned", label: "Unassigned Queue", badgeKey: "unassigned" },
      { href: "/supervisor/complaints/overdue", label: "Overdue / Risk", badgeKey: "overdue" },
    ]
  },
  { href: "/supervisor/staff", label: "Staff & Workload", icon: Users },
  { href: "/supervisor/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/supervisor/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/supervisor/messages", label: "Messages", icon: MessageSquare, badgeKey: "messages" },
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
  // State for expanded menus (optional, could default to open if active)
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    "/supervisor/complaints": true
  });

  const toggleMenu = (href: string) => {
    setOpenMenus(prev => ({ ...prev, [href]: !prev[href] }));
  };

  const handleLinkClick = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Desktop Header */}
      <div className="hidden lg:flex h-16 items-center px-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            SP
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-none">Smart Pokhara</h1>
            <p className="text-[10px] font-medium text-gray-500 mt-0.5 uppercase tracking-wide">Supervisor Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1 custom-scrollbar">
        <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Main Menu</p>
        
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact 
            ? pathname === item.href
            : pathname.startsWith(item.href);
          
          const mainBadge = item.badgeKey ? badgeCounts[item.badgeKey] : 0;
          const hasSubmenu = !!item.submenu;
          const isOpen = openMenus[item.href];

          return (
            <div key={item.href} className="space-y-1">
              {hasSubmenu ? (
                // Collapsible Menu Item
                <button
                  onClick={() => toggleMenu(item.href)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isActive 
                      ? "text-blue-700 bg-blue-50" 
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500")} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform duration-200", isOpen && "rotate-180")} />
                </button>
              ) : (
                // Direct Link
                <Link
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isActive 
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-white" : "text-gray-400 group-hover:text-gray-500")} />
                    <span>{item.label}</span>
                  </div>
                  {mainBadge > 0 && (
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold",
                      isActive ? "bg-white/20 text-white" : "bg-red-100 text-red-700"
                    )}>
                      {mainBadge > 99 ? "99+" : mainBadge}
                    </span>
                  )}
                </Link>
              )}

              {/* Submenu Items */}
              <AnimatePresence>
                {hasSubmenu && isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-4 pr-2 space-y-1 mt-1 border-l-2 border-gray-100 ml-4">
                      {item.submenu!.map((sub) => {
                        const isSubActive = pathname === sub.href;
                        const subBadge = sub.badgeKey ? badgeCounts[sub.badgeKey] : 0;
                        
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={handleLinkClick}
                            className={cn(
                              "flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                              isSubActive
                                ? "text-blue-700 font-semibold bg-blue-50"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            )}
                          >
                            <span>{sub.label}</span>
                            {subBadge > 0 && (
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-md">
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
        <div className="pt-6">
          <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">System</p>
          <Link
            href="/supervisor/settings"
            onClick={handleLinkClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
              pathname === "/supervisor/settings"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Settings className="h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            <span>Settings</span>
          </Link>
        </div>
      </div>

      {/* Footer / User Profile Snippet */}
      <div className="border-t border-gray-100 p-4 bg-gray-50/50">
        <button
          onClick={onLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isLoggingOut ? (
            <Loader2 className="h-5 w-5 animate-spin text-red-600" />
          ) : (
            <LogOut className="h-5 w-5 text-red-500 group-hover:text-red-600" />
          )}
          <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
        </button>
      </div>
    </div>
  );
}