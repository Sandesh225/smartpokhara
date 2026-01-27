"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";
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
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Loader2,
  Vote, // Added icon for Participatory Budgeting
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ComponentType } from "react";
import { useState } from "react";

// --- Types ---
export type SupervisorMenuItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badgeKey?: string;
  submenu?: { href: string; label: string; badgeKey?: string }[];
};

const MENU_ITEMS: SupervisorMenuItem[] = [
  { href: "/supervisor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/supervisor/complaints",
    label: "Complaints",
    icon: FileText,
    submenu: [
      { href: "/supervisor/complaints", label: "All Complaints" },
      {
        href: "/supervisor/complaints/unassigned",
        label: "Unassigned",
        badgeKey: "unassigned",
      },
      {
        href: "/supervisor/complaints/overdue",
        label: "Overdue",
        badgeKey: "overdue",
      },
    ],
  },
  {
    href: "/supervisor/participatory-budgeting",
    label: "Budget Proposals",
    icon: Vote,
    submenu: [
      { href: "/supervisor/participatory-budgeting", label: "Vetting Inbox" },
    ],
  },
  { href: "/supervisor/staff", label: "Staff", icon: Users },
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

interface SidebarProps {
  badgeCounts: Record<string, number>;
  onLogout: () => Promise<void>;
  isLoggingOut: boolean;
  className?: string;
}

export function SupervisorSidebar({
  badgeCounts,
  onLogout,
  isLoggingOut,
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse, closeMobile } = useSidebar();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    "/supervisor/complaints": pathname.includes("/complaints"),
    "/supervisor/participatory-budgeting": pathname.includes(
      "/participatory-budgeting"
    ),
  });

  const toggleSubmenu = (href: string) => {
    if (isCollapsed) toggleCollapse(); // Auto-expand if clicking submenu while collapsed
    setOpenSubmenus((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  const NavItem = ({ item }: { item: SupervisorMenuItem }) => {
    const isActive =
      pathname === item.href || pathname.startsWith(item.href + "/");
    const hasSubmenu = !!item.submenu;
    const isSubmenuOpen = openSubmenus[item.href];
    const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey] : 0;
    const Icon = item.icon;

    // Render Logic for Tooltip (Collapsed) vs Full Row (Expanded)
    const buttonContent = (
      <div
        className={cn(
          "flex items-center w-full p-2.5 rounded-lg transition-all duration-200 group relative",
          isActive
            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon
          className={cn("h-5 w-5 shrink-0", isCollapsed ? "mx-auto" : "mr-3")}
        />

        {!isCollapsed && (
          <span className="text-sm font-medium flex-1 truncate">
            {item.label}
          </span>
        )}

        {/* Badges */}
        {!isCollapsed && badgeCount > 0 && !hasSubmenu && (
          <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        )}

        {/* Collapsed Badge Dot */}
        {isCollapsed && badgeCount > 0 && (
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive border border-background" />
        )}

        {/* Chevron for Submenu */}
        {!isCollapsed && hasSubmenu && (
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isSubmenuOpen && "rotate-180"
            )}
          />
        )}
      </div>
    );

    if (hasSubmenu) {
      return (
        <div className="mb-1">
          <button onClick={() => toggleSubmenu(item.href)} className="w-full">
            {buttonContent}
          </button>
          <AnimatePresence>
            {!isCollapsed && isSubmenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden ml-4 pl-3 border-l border-border mt-1 space-y-1"
              >
                {item.submenu?.map((sub) => {
                  const subActive = pathname === sub.href;
                  const subBadge = sub.badgeKey ? badgeCounts[sub.badgeKey] : 0;
                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={closeMobile}
                      className={cn(
                        "flex items-center justify-between text-sm py-2 px-3 rounded-md transition-colors",
                        subActive
                          ? "text-primary font-semibold bg-primary/5"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <span>{sub.label}</span>
                      {subBadge > 0 && (
                        <span className="text-[10px] bg-red-100 text-red-700 px-1.5 rounded-full font-bold">
                          {subBadge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // Standard Link
    if (isCollapsed) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                onClick={closeMobile}
                className="block mb-1"
              >
                {buttonContent}
              </Link>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="font-semibold"
              sideOffset={10}
            >
              {item.label} {badgeCount > 0 && `(${badgeCount})`}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Link href={item.href} onClick={closeMobile} className="block mb-1">
        {buttonContent}
      </Link>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-card border-r border-border",
        className
      )}
    >
      {/* Brand Header */}
      <div
        className={cn(
          "h-16 flex items-center border-b border-border transition-all duration-300",
          isCollapsed ? "justify-center px-0" : "px-6"
        )}
      >
        <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-black shadow-lg shadow-primary/25 shrink-0">
          SP
        </div>
        {!isCollapsed && (
          <div className="ml-3 overflow-hidden">
            <h1 className="font-bold text-foreground leading-none tracking-tight">
              Smart Pokhara
            </h1>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-1">
              Supervisor Portal
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4 px-3">
        {!isCollapsed && (
          <div className="px-2 mb-2 text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">
            Menu
          </div>
        )}
        <nav className="space-y-1">
          {MENU_ITEMS.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </nav>

        {!isCollapsed && (
          <div className="px-2 mt-8 mb-2 text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">
            System
          </div>
        )}
        <div className="mt-2 space-y-1">
          <NavItem
            item={{
              href: "/supervisor/settings",
              label: "Settings",
              icon: Settings,
            }}
          />
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-3 border-t border-border bg-muted/20">
        <button
          onClick={onLogout}
          disabled={isLoggingOut}
          className={cn(
            "flex items-center w-full p-2 rounded-lg transition-all text-destructive hover:bg-destructive/10 group",
            isCollapsed ? "justify-center" : "justify-start"
          )}
        >
          {isLoggingOut ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <LogOut className="h-5 w-5 shrink-0" />
          )}
          {!isCollapsed && (
            <span className="ml-3 text-sm font-medium">
              {isLoggingOut ? "Signing out..." : "Sign Out"}
            </span>
          )}
        </button>

        {/* Desktop Collapse Toggle */}
        <div className="hidden lg:flex justify-center mt-2 pt-2 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className="w-full hover:bg-muted text-muted-foreground"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}