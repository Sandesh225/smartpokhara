"use client";

import { useState, useEffect } from "react";
import { Menu, Search, HelpCircle, User, Loader2 } from "lucide-react";
import type { CurrentUser } from "@/lib/types/auth";
import { GlobalSearch } from "@/components/supervisor/shared/GlobalSearch";
import { NotificationBell } from "@/components/supervisor/shared/NotificationBell";
import { NotificationDropdown } from "@/components/supervisor/shared/NotificationDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface SupervisorHeaderProps {
  user: CurrentUser;
  displayName: string;
  jurisdictionLabel: string;
  toggleSidebar?: () => void;
  badgeCounts: {
    notifications: number;
    messages: number;
    unassigned: number;
    overdue: number;
  };
}

export function SupervisorHeader({
  user,
  displayName,
  jurisdictionLabel,
  toggleSidebar,
  badgeCounts,
}: SupervisorHeaderProps) {
  const router = useRouter();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Fix for Hydration Mismatch: Only render complex interactive components on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fallback initials
  const initials = (displayName || user.email || "U").substring(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 transition-all duration-200">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* LEFT: Mobile Toggle + Search */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Global Search Component */}
          <div className="hidden md:block w-full max-w-md">
            <GlobalSearch userId={user.id} />
          </div>
        </div>

        {/* RIGHT: Actions + Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Jurisdiction Pill (Desktop Only) */}
          <div className="hidden xl:flex flex-col items-end mr-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Jurisdiction
            </span>
            <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
              {jurisdictionLabel}
            </span>
          </div>

          <div className="h-6 w-px bg-gray-200 hidden md:block" />

          {/* Notification Bell */}
          <div className="relative">
            <NotificationBell
              unreadCount={badgeCounts.notifications}
              isOpen={notificationsOpen}
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            />

            {/* Notifications Dropdown */}
            {isMounted && (
              <NotificationDropdown
                notifications={[]} // You'll populate this with real data later
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                onMarkAsRead={() => {}}
                onMarkAllAsRead={() => {}}
              />
            )}
          </div>

          {/* Profile Dropdown - Mounted Check Required for Radix UI */}
          {isMounted ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="group flex items-center gap-3 pl-2 focus:outline-none">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-semibold text-gray-900 leading-none group-hover:text-blue-700 transition-colors">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Supervisor</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white group-hover:ring-blue-100 transition-all">
                    {user.profile?.profile_photo_url ? (
                      <img
                        src={user.profile.profile_photo_url}
                        alt={displayName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/supervisor/profile")}
                >
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/supervisor/settings")}
                >
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/help")}>
                  <HelpCircle className="mr-2 h-4 w-4" /> Help & Support
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Static Fallback for SSR to prevent layout shift
            <div className="flex items-center gap-3 pl-2">
              <div className="hidden sm:block text-right">
                <div className="h-4 w-24 bg-gray-100 rounded mb-1 animate-pulse" />
                <div className="h-3 w-16 bg-gray-100 rounded animate-pulse ml-auto" />
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-100 animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}