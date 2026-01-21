"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  Menu,
  Search,
  LogOut,
  User,
  Moon,
  Sun,
  Settings,
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
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { mode, toggleMode } = useThemeMode();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdowns when clicking outside
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

  // Real-time notifications
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
    <header className="sticky top-0 z-40 h-20 sm:h-24 shrink-0 border-b-2 border-border bg-card/90 dark:bg-dark-surface/90 backdrop-blur-2xl transition-all duration-300 elevation-2">
      <div className="flex h-full items-center justify-between gap-4 sm:gap-6 px-4 sm:px-6 lg:px-8">
        {/* Left Section - Menu & Search */}
        <div className="flex flex-1 items-center gap-4 sm:gap-5 max-w-3xl">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden h-12 w-12 sm:h-13 sm:w-13 flex items-center justify-center rounded-xl bg-card border-2 border-border text-muted-foreground hover:bg-accent hover:text-foreground hover:border-primary transition-all duration-300 active:scale-95 elevation-1 hover:elevation-2"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Search Bar */}
          <div className="hidden sm:block w-full max-w-xl">
            <div className="relative group">
              <Search
                className={cn(
                  "absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-all duration-300",
                  searchFocused
                    ? "text-primary scale-110"
                    : "text-muted-foreground"
                )}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services, bills, complaints..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full h-13 rounded-xl border-2 border-border focus:border-primary bg-card dark:bg-dark-surface py-3 pl-12 pr-5 text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:ring-4 focus:ring-primary/15 transition-all duration-300 outline-none font-medium elevation-1 focus:elevation-2"
              />
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleMode}
            className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-xl border-2 border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground hover:border-primary transition-all duration-300 active:scale-95 elevation-1 hover:elevation-2"
            aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
          >
            {!mounted ? (
              <div className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse rounded-full bg-muted" />
            ) : mode === "dark" ? (
              <Sun className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500 transition-transform hover:rotate-90 duration-300" />
            ) : (
              <Moon className="h-5 w-5 sm:h-6 sm:w-6 text-primary transition-transform hover:-rotate-12 duration-300" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className={cn(
                "h-12 w-12 sm:h-13 sm:w-13 flex items-center justify-center rounded-xl border-2 transition-all duration-300 active:scale-95 elevation-1 hover:elevation-2",
                notificationOpen
                  ? "border-primary bg-primary/15 dark:bg-primary/25 text-primary scale-105 elevation-3"
                  : "border-border bg-card hover:bg-accent hover:border-primary"
              )}
              aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ""}`}
            >
              <Bell
                className={cn(
                  "h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300",
                  notificationCount > 0 && !notificationOpen && "animate-bounce"
                )}
              />
              {notificationCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="absolute -top-1.5 -right-1.5 h-6 min-w-[24px] rounded-full bg-destructive text-xs font-black text-destructive-foreground flex items-center justify-center ring-4 ring-background px-2 elevation-2"
                >
                  {notificationCount > 99 ? "99+" : notificationCount}
                </motion.span>
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

          {/* User Profile Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 sm:gap-4 rounded-xl border-2 border-transparent hover:border-border hover:bg-accent/80 px-3 sm:px-4 py-2.5 transition-all duration-300 active:scale-95 elevation-1 hover:elevation-2"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              <Avatar className="h-11 w-11 sm:h-12 sm:w-12 ring-2 ring-border elevation-1">
                <AvatarImage
                  src={profilePhotoUrl || ""}
                  alt={user.displayName}
                />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-black text-base sm:text-lg">
                  {user.displayName?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start min-w-0">
                <span className="text-sm sm:text-base font-black text-foreground truncate max-w-[140px]">
                  {user.displayName}
                </span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {user.roleName}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  "hidden sm:block h-4 w-4 text-muted-foreground transition-transform duration-300",
                  userMenuOpen && "rotate-180"
                )}
              />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-4 w-72 rounded-2xl border-2 border-border bg-card p-4 elevation-3 z-50"
                >
                  {/* User Info Header */}
                  <div className="px-5 py-4 bg-muted/70 dark:bg-muted/50 rounded-xl mb-4">
                    <p className="text-base font-black text-foreground truncate">
                      {user.displayName}
                    </p>
                    <p className="text-sm text-muted-foreground truncate mt-1.5">
                      {user.email}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <Link
                    href="/citizen/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-4 px-5 py-3.5 text-sm sm:text-base font-bold hover:bg-accent rounded-xl transition-all duration-300 group"
                  >
                    <User className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    href="/citizen/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-4 px-5 py-3.5 text-sm sm:text-base font-bold hover:bg-accent rounded-xl transition-all duration-300 group"
                  >
                    <Settings className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span>Settings</span>
                  </Link>

                  {/* Sign Out */}
                  <div className="my-4 border-t-2 border-border" />
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-4 px-5 py-3.5 text-sm sm:text-base font-black text-destructive hover:bg-destructive/15 dark:hover:bg-destructive/20 rounded-xl transition-all duration-300 group"
                  >
                    <LogOut className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                    <span>Sign Out</span>
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