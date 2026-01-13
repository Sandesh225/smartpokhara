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
  Moon,
  Sun,
} from "lucide-react";
import { useThemeMode } from "flowbite-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import NotificationDropdown from "./NotificationDropdown";

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
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Use Flowbite's hook for state-managed theme toggling
  const { mode, toggleMode } = useThemeMode();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const profilePhotoUrl =
    user?.profile?.profile_photo_url ?? user?.avatar_url ?? null;

  return (
    <header className="sticky top-0 z-30 h-20 shrink-0 border-b border-border glass-strong transition-colors duration-300">
      <div className="flex h-full items-center justify-between gap-4 px-6 lg:px-8">
        {/* Search Section */}
        <div className="flex flex-1 items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden h-10 w-10 flex items-center justify-center rounded-xl bg-card border border-border text-muted-foreground hover:bg-accent/10 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden w-full max-w-md lg:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search services..."
                className="w-full h-11 rounded-xl border border-input bg-card py-2 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* THEME TOGGLE */}
          <button
            onClick={toggleMode}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-accent transition-all"
          >
            {!mounted ? (
              <div className="h-5 w-5 animate-pulse rounded-full bg-muted" />
            ) : mode === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className={cn(
                "h-10 w-10 flex items-center justify-center rounded-xl border transition-all",
                notificationOpen
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card"
              )}
            >
              <Bell
                className={cn(
                  "h-5 w-5",
                  notificationCount > 0 && "animate-bounce"
                )}
              />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-card">
                  {notificationCount}
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

          {/* User Profile */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 hover:bg-accent/50 transition-all"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={profilePhotoUrl || ""} />
                <AvatarFallback className="bg-primary text-white font-bold">
                  {user.displayName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start lg:flex">
                <span className="text-sm font-bold text-foreground truncate max-w-[120px]">
                  {user.displayName}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase">
                  {user.roleName}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  userMenuOpen && "rotate-180"
                )}
              />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-border bg-card p-2 shadow-xl z-50"
                >
                  <div className="px-4 py-3 bg-muted/50 rounded-xl mb-2">
                    <p className="text-sm font-bold truncate">
                      {user.displayName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <Link
                    href="/citizen/profile"
                    className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent rounded-lg transition-colors"
                  >
                    <User className="h-4 w-4" /> My Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors font-bold mt-2 pt-2 border-t border-border"
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