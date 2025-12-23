"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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

  // Listen for real-time notifications to update the badge count globally
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
        loading: "Cleaning session...",
        success: "Signed out safely",
        error: "Could not clear session",
      }
    );
  };

  return (
    <header className="sticky top-0 z-30 h-20 shrink-0 border-b-2 border-slate-100 bg-white/80 backdrop-blur-xl transition-all">
      <div className="flex h-full items-center justify-between gap-4 px-6 lg:px-10">
        {/* Left: Search Bar with "Command" style */}
        <div className="flex flex-1 items-center gap-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 border border-slate-200"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden w-full max-w-md lg:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Search Registry..."
                className="w-full h-11 rounded-2xl border-2 border-slate-100 bg-slate-50/50 py-2 pl-12 pr-4 text-sm font-bold outline-none transition-all placeholder:text-slate-400 focus:border-blue-600/20 focus:bg-white focus:ring-4 focus:ring-blue-600/5"
              />
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-5">
          {/* Real-time Notifications Bell */}
          <div className="relative">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className={cn(
                      "relative h-11 w-11 flex items-center justify-center rounded-2xl border-2 transition-all",
                      notificationOpen
                        ? "border-blue-600 bg-blue-50 text-blue-600 shadow-lg shadow-blue-600/10"
                        : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
                    )}
                  >
                    <Bell
                      className={cn(
                        "h-5 w-5",
                        notificationCount > 0 &&
                          "animate-[bell-swing_2s_infinite]"
                      )}
                    />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white ring-4 ring-white">
                        {notificationCount}
                      </span>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent className="rounded-xl font-bold">
                  {notificationCount} Unread Alerts
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

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

          <div className="h-8 w-[2px] bg-slate-100 mx-1 hidden sm:block" />

          {/* User Profile Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 rounded-2xl border-2 border-transparent p-1 transition-all hover:bg-slate-50"
            >
              <Avatar className="h-10 w-10 border-2 border-white shadow-md ring-2 ring-slate-100">
                <AvatarImage src={profilePhotoUrl || ""} />
                <AvatarFallback className="bg-blue-600 text-white font-black text-xs uppercase">
                  {user.displayName?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="hidden flex-col items-start lg:flex text-left">
                <span className="text-xs font-black text-slate-900 leading-none truncate max-w-[120px]">
                  {user.displayName}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 mt-1">
                  {user.roleName || "Citizen"}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  "hidden h-4 w-4 text-slate-400 transition-transform lg:block",
                  userMenuOpen && "rotate-180"
                )}
              />
            </button>

            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full mt-3 w-64 rounded-[1.5rem] border-2 border-slate-100 bg-white p-2 shadow-2xl z-50 ring-1 ring-slate-900/5"
              >
                <div className="px-4 py-3 bg-slate-50/50 rounded-2xl mb-2">
                  <p className="text-xs font-black text-slate-900 truncate">
                    {user.displayName}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 truncate">
                    {user.email}
                  </p>
                </div>

                <div className="space-y-1">
                  <Link
                    href="/citizen/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all"
                  >
                    <User className="h-4 w-4" /> My Registry Profile
                  </Link>
                  <Link
                    href="/citizen/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all"
                  >
                    <Settings className="h-4 w-4" /> Account Settings
                  </Link>
                </div>

                <div className="my-2 border-t border-slate-100" />

                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-xs font-black text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
