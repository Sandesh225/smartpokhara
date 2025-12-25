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

import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationDropdown } from "../NotificationDropdown";

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

  // Listen for real-time notifications
  useEffect(() => {
    const channel = supabase
      .channel("header-notifs")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => onCountUpdate(notificationCount + 1)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id, notificationCount, onCountUpdate, supabase]);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const profilePhotoUrl =
    user?.profile?.profile_photo_url ?? user?.avatar_url ?? null;

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
    <header className="sticky top-0 z-30 h-20 shrink-0 border-b border-[rgb(229,231,235)] glass-strong">
      <div className="flex h-full items-center justify-between gap-4 px-6 lg:px-8">
        {/* Left: Mobile Menu + Search */}
        <div className="flex flex-1 items-center gap-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-[rgb(229,231,235)] text-[rgb(107,114,128)] hover:text-[rgb(26,32,44)] hover:bg-[rgb(249,250,251)] transition-colors shadow-sm"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden w-full max-w-md lg:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(156,163,175)] group-focus-within:text-[rgb(43,95,117)] transition-colors" />
              <input
                type="text"
                placeholder="Search services, complaints, bills..."
                className="w-full h-11 rounded-xl border border-[rgb(229,231,235)] bg-white py-2 pl-11 pr-4 text-sm font-medium outline-none transition-all placeholder:text-[rgb(156,163,175)] focus:border-[rgb(43,95,117)] focus:ring-2 focus:ring-[rgb(43,95,117)]/10"
              />
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className={cn(
                "relative h-10 w-10 flex items-center justify-center rounded-xl border transition-all",
                notificationOpen
                  ? "border-[rgb(43,95,117)] bg-[rgb(43,95,117)]/5 text-[rgb(43,95,117)] shadow-md"
                  : "border-[rgb(229,231,235)] bg-white text-[rgb(107,114,128)] hover:border-[rgb(209,213,219)] hover:bg-[rgb(249,250,251)]"
              )}
              aria-label={`Notifications: ${notificationCount} unread`}
            >
              <Bell
                className={cn(
                  "h-5 w-5",
                  notificationCount > 0 && "animate-[bell-swing_2s_infinite]"
                )}
              />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full bg-[rgb(43,95,117)] text-[10px] font-mono font-bold text-white ring-2 ring-white tabular-nums">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notificationOpen && (
                <NotificationDropdown
                  userId={user.id}
                  onClose={() => setNotificationOpen(false)}
                  onCountUpdate={onCountUpdate}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="h-6 w-px bg-[rgb(229,231,235)] hidden sm:block" />

          {/* User Profile Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 hover:bg-[rgb(249,250,251)] hover:border-[rgb(229,231,235)] transition-all"
              aria-label="User menu"
              aria-expanded={userMenuOpen}
            >
              <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-[rgb(229,231,235)]">
                <AvatarImage
                  src={profilePhotoUrl || ""}
                  alt={user.displayName}
                />
                <AvatarFallback className="bg-[rgb(43,95,117)] text-white font-bold text-sm">
                  {user.displayName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="hidden flex-col items-start lg:flex text-left">
                <span className="text-sm font-bold text-[rgb(26,32,44)] leading-tight truncate max-w-[140px]">
                  {user.displayName}
                </span>
                <span className="text-[10px] font-medium text-[rgb(107,114,128)] mt-0.5 uppercase tracking-wide">
                  {user.roleName || "Citizen"}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  "hidden h-4 w-4 text-[rgb(156,163,175)] transition-transform lg:block",
                  userMenuOpen && "rotate-180"
                )}
              />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-[rgb(229,231,235)] bg-white p-2 shadow-xl z-50 elevation-4"
                >
                  {/* User Info */}
                  <div className="px-4 py-3 bg-[rgb(249,250,251)] rounded-xl mb-2">
                    <p className="text-sm font-bold text-[rgb(26,32,44)] truncate leading-tight">
                      {user.displayName}
                    </p>
                    <p className="text-xs font-medium text-[rgb(107,114,128)] truncate mt-1">
                      {user.email}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-0.5">
                    <Link
                      href="/citizen/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[rgb(75,85,99)] hover:bg-[rgb(249,250,251)] hover:text-[rgb(43,95,117)] transition-all"
                    >
                      <User className="h-4 w-4" /> My Profile
                    </Link>
                    <Link
                      href="/citizen/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[rgb(75,85,99)] hover:bg-[rgb(249,250,251)] hover:text-[rgb(43,95,117)] transition-all"
                    >
                      <Settings className="h-4 w-4" /> Settings
                    </Link>
                  </div>

                  <div className="my-2 border-t border-[rgb(229,231,235)]" />

                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-[rgb(239,68,68)] hover:bg-[rgb(239,68,68)]/5 transition-all"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
