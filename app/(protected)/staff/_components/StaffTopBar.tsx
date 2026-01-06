"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { CurrentUser } from "@/lib/types/auth";
import { getUserDisplayName } from "@/lib/auth/role-helpers";
import {
  Bell,
  Menu,
  MessageSquare,
  LogOut,
  LayoutDashboard,
  Settings,
  ChevronDown,
  User,
  Search,
} from "lucide-react";

interface StaffTopBarProps {
  user: CurrentUser;
  onMenuClick?: () => void;
}

const TITLE_MAP: Record<string, string> = {
  "/staff/dashboard": "Dashboard",
  "/staff/queue": "My Queue",
  "/staff/schedule": "Shift Schedule",
  "/staff/performance": "Performance Metrics",
  "/staff/messages": "Communications",
  "/staff/team": "Team Directory",
  "/staff/resources": "Knowledge Base",
  "/staff/help": "Support Center",
  "/staff/notifications": "Notifications",
  "/staff/attendance": "Attendance Records",
  "/staff/leave": "Leave Management",
  "/staff/training": "Training & Skills",
  "/staff/settings": "Account Settings",
};

export function StaffTopBar({ user, onMenuClick }: StaffTopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Dynamic Title Logic
  const pageTitle = useMemo(() => {
    if (pathname.startsWith("/staff/queue/")) return "Task Details";
    if (pathname.startsWith("/staff/messages/")) return "Chat Session";
    // Check exact match or fallback
    return TITLE_MAP[pathname] ?? "Staff Portal";
  }, [pathname]);

  // Click Outside Handler
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
      setIsLoggingOut(false);
    }
  };

  const displayName = getUserDisplayName(user);
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-30 w-full glass border-b border-border transition-all duration-300">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        {/* LEFT: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-4 lg:gap-6 min-w-0">
          <button
            type="button"
            className="lg:hidden p-2 -ml-2 rounded-lg text-muted-foreground hover:bg-neutral-stone-100 hover:text-foreground transition-colors active:scale-95"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-col justify-center min-w-0">
            <h1 className="text-base lg:text-lg font-bold text-foreground tracking-tight truncate leading-tight">
              {pageTitle}
            </h1>
            <p className="hidden md:block text-xs text-muted-foreground font-medium truncate">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* RIGHT: Actions & Profile */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Search (Desktop Only) */}
          <div className="hidden md:flex items-center relative mr-2">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="h-9 pl-9 pr-4 rounded-full bg-neutral-stone-100 border-none text-sm focus:ring-2 focus:ring-primary/20 w-48 lg:w-64 transition-all"
            />
          </div>

          {/* Icons: Messages & Notifications */}
          <div className="flex items-center gap-1">
            <Link
              href="/staff/messages"
              className="p-2.5 rounded-full text-muted-foreground hover:bg-neutral-stone-100 hover:text-primary transition-colors relative group"
              aria-label="Messages"
            >
              <MessageSquare className="h-5 w-5" />
            </Link>

            <Link
              href="/staff/notifications"
              className="p-2.5 rounded-full text-muted-foreground hover:bg-neutral-stone-100 hover:text-primary transition-colors relative group"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-destructive border border-white group-hover:animate-pulse" />
            </Link>
          </div>

          {/* User Menu Dropdown */}
          <div className="relative ml-1" ref={menuRef}>
            <button
              onClick={() => setIsUserMenuOpen((v) => !v)}
              className={`flex items-center gap-2 rounded-full pl-1.5 pr-2 py-1.5 transition-all duration-200 border ${
                isUserMenuOpen
                  ? "bg-neutral-stone-100 border-primary/20 ring-2 ring-primary/10"
                  : "bg-transparent border-transparent hover:bg-neutral-stone-100/50"
              }`}
            >
              <div className="h-8 w-8 rounded-full bg-linear-to-br from-primary to-primary-dark text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-white">
                {initials}
              </div>
              <div className="hidden lg:flex flex-col items-start text-left">
                <span className="text-xs font-semibold text-foreground leading-none mb-0.5">
                  {displayName}
                </span>
                <span className="text-[10px] text-muted-foreground leading-none">
                  View Profile
                </span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 hidden lg:block ${
                  isUserMenuOpen ? "rotate-180 text-primary" : ""
                }`}
              />
            </button>

            {/* Dropdown Content (Stone Card) */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-3 w-72 origin-top-right rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 focus:outline-none z-50 overflow-hidden">
                {/* User Info Header */}
                <div className="px-5 py-4 bg-neutral-stone-50/50 border-b border-border">
                  <p className="text-sm font-bold text-foreground">
                    {displayName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {user.email}
                  </p>
                  <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary uppercase tracking-wide">
                    {user.roles?.[0]?.replace("_", " ") || "Staff"}
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  <Link
                    href="/staff/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground rounded-xl hover:bg-neutral-stone-50 hover:text-foreground transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>

                  <Link
                    href="/citizen/dashboard"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground rounded-xl hover:bg-neutral-stone-50 hover:text-foreground transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Switch to Citizen View
                  </Link>
                </div>

                <div className="p-2 border-t border-border">
                  <button
                    onClick={handleSignOut}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-destructive rounded-xl hover:bg-destructive/5 hover:text-destructive transition-colors disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4" />
                    {isLoggingOut ? "Signing out..." : "Sign Out"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}