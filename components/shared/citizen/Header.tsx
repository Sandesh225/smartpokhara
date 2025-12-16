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
  Shield,
  RefreshCcw,
} from "lucide-react";
import NotificationDropdown from "@/components/shared/citizen/NotificationDropdown";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  const profilePhotoUrl =
    user?.profile?.profile_photo_url ??
    user?.profile_photo_url ??
    user?.avatar_url ??
    null;

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
    toast.promise(
      async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
      },
      {
        loading: "Signing out...",
        success: "Signed out successfully",
        error: "Failed to sign out",
      }
    );
  };

  return (
    <header className="sticky top-0 z-30 h-16 shrink-0 border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="flex h-full items-center justify-between gap-4 px-4 lg:px-8">
        {/* Left: Menu & Search */}
        <div className="flex flex-1 items-center gap-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="hidden w-full max-w-sm lg:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search complaints, bills, notices..."
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                aria-label="Global search"
              />
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="relative rounded-full p-2.5 text-gray-500 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Notifications"
                    aria-expanded={notificationOpen}
                  >
                    <Bell className="h-5 w-5" />
                    {notificationCount > 0 && (
                      <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
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
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {notificationCount > 0
                    ? `${notificationCount} unread notifications`
                    : "No new notifications"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="group flex items-center gap-3 rounded-full border border-transparent py-1 pl-1 pr-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Avatar className="h-8 w-8 ring-2 ring-gray-100 group-hover:ring-blue-100 transition-all">
                <AvatarImage
                  src={profilePhotoUrl || ""}
                  alt={user.displayName}
                />
                <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                  {user.displayName?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="hidden flex-col items-start lg:flex">
                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                  {user.displayName}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                  {user.roleName || "Citizen"}
                </span>
              </div>
              <ChevronDown
                className={`hidden h-4 w-4 text-gray-400 transition-transform lg:block ${userMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-60 origin-top-right rounded-xl border border-gray-100 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in slide-in-from-top-1 fade-in">
                <div className="px-3 py-2 border-b border-gray-100 mb-1">
                  <p className="font-medium text-gray-900 truncate">
                    {user.displayName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>

                <Link
                  href="/citizen/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                >
                  <User className="h-4 w-4" /> My Profile
                </Link>
                <Link
                  href="/citizen/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                >
                  <Settings className="h-4 w-4" /> Settings
                </Link>

                {/* Role Switch Mockup - Future Proofing */}
                <button
                  disabled
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 cursor-not-allowed opacity-70"
                >
                  <RefreshCcw className="h-4 w-4" /> Switch Role{" "}
                  <span className="text-[10px] ml-auto border border-gray-200 px-1 rounded">
                    Soon
                  </span>
                </button>

                <div className="my-1 border-t border-gray-100" />

                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}