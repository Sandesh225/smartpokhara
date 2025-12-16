"use client";

import { useState, useEffect } from "react";
import { Menu, HelpCircle, User, Shield } from "lucide-react";
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
import { cn } from "@/lib/utils";

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

  // Prevent hydration mismatch for Radix/portals
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const initials = (displayName || user.email || "U")
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-xl border-b border-gray-200/60 shadow-sm h-16 transition-all duration-200">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* LEFT: Mobile Toggle + Search */}
        <div className="flex items-center gap-3 flex-1">
          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 active:scale-95"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Global Search Component */}
          <div className="hidden md:block w-full max-w-lg">
            <GlobalSearch userId={user.id} />
          </div>
        </div>

        {/* RIGHT: Actions + Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Jurisdiction Pill (Desktop Only) */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-full mr-2">
            <Shield className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-blue-600/70 uppercase tracking-wider leading-none">
                Jurisdiction
              </span>
              <span className="text-xs font-semibold text-blue-900 leading-tight mt-0.5">
                {jurisdictionLabel}
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-gray-200 hidden md:block" />

          {/* Notification Bell */}
          <div className="relative">
            <NotificationBell
              unreadCount={badgeCounts.notifications}
              isOpen={notificationsOpen}
              onClick={() => setNotificationsOpen((prev) => !prev)}
            />

            {isMounted && (
              <NotificationDropdown
                notifications={[]} // TODO: Wire real notifications once backend API is connected
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                onMarkAsRead={() => {}}
                onMarkAllAsRead={() => {}}
              />
            )}
          </div>

          {/* Profile Dropdown */}
          {isMounted ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="group flex items-center gap-2.5 pl-1.5 pr-2 py-1.5 rounded-full hover:bg-gray-100/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 active:scale-95"
                >
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-semibold text-gray-900 leading-none group-hover:text-blue-700 transition-colors">
                      {displayName}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
                      Supervisor
                    </p>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-600/20 ring-2 ring-white group-hover:ring-blue-100 group-hover:shadow-lg group-hover:shadow-blue-600/30 transition-all duration-200">
                    {user.profile?.profile_photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
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
              <DropdownMenuContent
                align="end"
                className={cn("w-56 mt-2 shadow-xl border-gray-200/60")}
              >
                <DropdownMenuLabel className="font-semibold">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/supervisor/profile")}
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/supervisor/settings")}
                  className="cursor-pointer"
                >
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/help")}
                  className="cursor-pointer"
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help &amp; Support
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Static Fallback for SSR
            <div className="flex items-center gap-2.5 pl-1.5">
              <div className="hidden sm:block text-right">
                <div className="h-4 w-24 bg-gray-100 rounded mb-1 animate-pulse" />
                <div className="h-3 w-16 bg-gray-100 rounded animate-pulse ml-auto" />
              </div>
              <div className="h-9 w-9 rounded-full bg-gray-100 animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
