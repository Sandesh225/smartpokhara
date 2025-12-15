"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { CurrentUser } from "@/lib/types/auth";
import { getUserDisplayName } from "@/lib/auth/role-helpers";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Menu,
  MessageSquare,
  LogOut,
  LayoutDashboard,
  Settings,
  ChevronDown,
} from "lucide-react";

interface StaffTopBarProps {
  user: CurrentUser;
  onMenuClick?: () => void;
  // Optional in future:
  // unreadMessages?: number;
  // unreadNotifications?: number;
}

const TITLE_MAP: Record<string, string> = {
  "/staff/dashboard": "Dashboard",
  "/staff/queue": "My Queue",
  "/staff/schedule": "My Schedule",
  "/staff/performance": "My Performance",
  "/staff/messages": "Messages",
  "/staff/team": "My Team",
  "/staff/resources": "Resources",
  "/staff/help": "Help",
  "/staff/notifications": "Notifications",
  "/staff/attendance": "Attendance",
  "/staff/leave": "Leave",
  "/staff/training": "Training",
  "/staff/settings": "Settings",
};

export function StaffTopBar({ user, onMenuClick }: StaffTopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  const pageTitle = useMemo(() => {
    // best-effort match for nested routes (e.g. /staff/queue/[id])
    if (pathname.startsWith("/staff/queue/")) return "Task Detail";
    if (pathname.startsWith("/staff/messages/")) return "Conversation";
    return TITLE_MAP[pathname] ?? "Staff Portal";
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsUserMenuOpen(false);
    };
    const onMouseDown = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (isUserMenuOpen && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [isUserMenuOpen]);

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
    <header className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {/* Mobile menu */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden hover:bg-gray-100 active:scale-95 transition-transform"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-gray-900 truncate">
            {pageTitle}
          </p>
          <p className="text-xs text-gray-500 truncate font-medium">
            Welcome back, {displayName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="relative text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all"
          >
            <Link href="/staff/messages" aria-label="Messages">
              <MessageSquare className="h-5 w-5" />
              {/* Badge hook (optional later)
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              */}
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="icon"
            className="relative text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all"
          >
            <Link href="/staff/notifications" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Link>
          </Button>

          <div className="relative ml-2" ref={menuRef}>
            <Button
              variant="ghost"
              onClick={() => setIsUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border-2 border-gray-200 bg-white pl-1.5 pr-3 hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all h-11"
              aria-haspopup="menu"
              aria-expanded={isUserMenuOpen}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-xs font-bold text-white ring-2 ring-white shadow-md">
                {initials}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-semibold text-gray-900">
                  {displayName}
                </p>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-gray-500 transition-transform hidden sm:block ${isUserMenuOpen ? "rotate-180" : ""}`}
              />
            </Button>

            {isUserMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-500/10 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white px-4 py-4">
                  <p className="text-sm font-bold text-gray-900 mb-1">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-600 truncate font-medium">
                    {user.email}
                  </p>
                </div>

                <div className="py-2">
                  <Link
                    href="/staff/settings"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                    role="menuitem"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <Settings className="h-4 w-4 text-gray-600" />
                    </div>
                    <span>Settings</span>
                  </Link>

                  <Link
                    href="/citizen/dashboard"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                    role="menuitem"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <LayoutDashboard className="h-4 w-4 text-gray-600" />
                    </div>
                    <span>Citizen View</span>
                  </Link>

                  <div className="my-2 mx-3 border-t border-gray-200" />

                  <button
                    onClick={handleSignOut}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    role="menuitem"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                      <LogOut className="h-4 w-4 text-red-600" />
                    </div>
                    <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
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
