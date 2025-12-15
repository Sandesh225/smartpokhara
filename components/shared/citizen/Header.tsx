// components/shared/citizen/Header.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  Menu,
  Search,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import NotificationDropdown from "@/components/shared/citizen/NotificationDropdown";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  user: any;
  setSidebarOpen: (open: boolean) => void;
  notificationCount: number;
  onCountUpdate: (count: number) => void;
}

export default function Header({
  user,
  setSidebarOpen,
  notificationCount,
  onCountUpdate,
}: HeaderProps) {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // Assumption: profile photo URL is stored on user.profile.profile_photo_url (matches your profile schema)
  const profilePhotoUrl =
    user?.profile?.profile_photo_url ??
    user?.profile_photo_url ??
    user?.avatar_url ??
    null;

  // Close dropdown on click outside + ESC key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setUserMenuOpen(false);
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 h-16 shrink-0 border-b border-gray-200/80 bg-white/80 backdrop-blur-xl shadow-sm supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-full items-center justify-between gap-4 px-4 lg:px-6">
        {/* Left: Hamburger (Mobile Only) & Search */}
        <div className="flex flex-1 items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden rounded-xl p-2.5 text-gray-600 transition-all hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="hidden max-w-md flex-1 md:block">
            <label className="sr-only" htmlFor="citizen-search">
              Search
            </label>
            <div className="group relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-600" />
              <input
                id="citizen-search"
                type="text"
                placeholder="Search services, complaints, bills..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative rounded-xl p-2.5 text-gray-600 transition-all hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
              aria-label="Open notifications"
              aria-haspopup="menu"
              aria-expanded={notificationOpen}
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                </span>
              )}
            </button>

            {notificationOpen && (
              <NotificationDropdown
                userId={user.id}
                onClose={() => setNotificationOpen(false)}
                onCountUpdate={onCountUpdate}
              />
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="group flex items-center gap-2 rounded-full border-2 border-transparent p-1.5 pl-3 transition-all hover:border-blue-200/50 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
              aria-label="Open user menu"
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
            >
              <div className="mr-1 hidden flex-col items-end lg:flex">
                <span className="text-sm font-bold leading-none text-gray-800 transition-colors group-hover:text-blue-700">
                  {user.displayName}
                </span>
                <span className="mt-0.5 text-xs leading-none text-gray-500">
                  Citizen
                </span>
              </div>

              <Avatar className="h-9 w-9 ring-2 ring-white shadow-md transition-all group-hover:scale-105 group-hover:shadow-lg">
                <AvatarImage src={profilePhotoUrl || ""} alt={user.displayName} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                  {user?.displayName?.charAt(0)?.toUpperCase() || "C"}
                </AvatarFallback>
              </Avatar>

              <ChevronDown
                className={`hidden h-4 w-4 text-gray-400 transition-transform duration-200 lg:block ${
                  userMenuOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>

            {userMenuOpen && (
              <div
                role="menu"
                aria-label="User menu"
                className="absolute right-0 top-full z-50 mt-2 w-64 animate-in slide-in-from-top-2 fade-in rounded-2xl border border-gray-100 bg-white py-2 shadow-xl duration-200"
              >
                {/* User info header */}
                <div className="border-b border-gray-100 px-4 py-3">
                  <p className="font-bold text-gray-900">{user.displayName}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{user.email}</p>
                </div>

                <div className="p-1.5">
                  <Link
                    role="menuitem"
                    href="/citizen/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
                  >
                    <div className="rounded-lg bg-blue-100 p-1.5 text-blue-600 transition-transform group-hover:scale-110">
                      <User className="h-4 w-4" />
                    </div>
                    My Profile
                  </Link>

                  <Link
                    role="menuitem"
                    href="/citizen/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
                  >
                    <div className="rounded-lg bg-indigo-100 p-1.5 text-indigo-600 transition-all group-hover:rotate-90 group-hover:scale-110">
                      <Settings className="h-4 w-4" />
                    </div>
                    Settings
                  </Link>
                </div>

                <div className="mt-1 border-t border-gray-100 p-1.5">
                  <button
                    role="menuitem"
                    type="button"
                    onClick={handleSignOut}
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition-all hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20"
                  >
                    <div className="rounded-lg bg-red-100 p-1.5 text-red-600 transition-transform group-hover:scale-110">
                      <LogOut className="h-4 w-4" />
                    </div>
                    Sign Out
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
