"use client";

import { useEffect, useRef, useState, useMemo } from "react";
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
  Command,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
// Import your dropdown component here
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
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const supabase = createClient();

  const profilePhotoUrl = useMemo(
    () => user?.profile?.profile_photo_url ?? user?.avatar_url ?? null,
    [user]
  );

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Real-time listener
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
        success: "Signed out!",
        error: "Error signing out",
      }
    );
  };

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
  };

  return (
    <header className="sticky top-0 z-40 h-20 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between gap-4 px-6 lg:px-10">
        {/* Search Section */}
        <div className="flex flex-1 items-center gap-6 max-w-2xl">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden h-11 w-11 flex items-center justify-center rounded-xl border border-border bg-card"
          >
            <Menu className="h-5 w-5 text-muted-foreground" />
          </button>

          <div
            className={cn(
              "hidden sm:flex flex-1 items-center rounded-2xl border-2 transition-all duration-300",
              searchFocused
                ? "border-primary bg-background ring-4 ring-primary/5"
                : "border-border bg-muted/20"
            )}
          >
            <Search
              className={cn(
                "ml-4 h-5 w-5 transition-colors",
                searchFocused ? "text-primary" : "text-muted-foreground"
              )}
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search services..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full bg-transparent px-3 py-2.5 text-sm outline-none font-medium"
            />
            <kbd className="mr-3 hidden items-center gap-1 rounded border bg-background px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground lg:flex">
              <Command className="h-3 w-3" />K
            </kbd>
          </div>
        </div>

        {/* Action Section */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="h-11 w-11 flex items-center justify-center rounded-2xl border border-border bg-card hover:border-primary transition-all"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-amber-500" />
            ) : (
              <Moon className="h-5 w-5 text-primary" />
            )}
          </button>

          {/* Notifications Trigger */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className={cn(
                "h-11 w-11 flex items-center justify-center rounded-2xl border transition-all relative",
                notificationOpen
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary"
              )}
            >
              <Bell
                className={cn(
                  "h-5 w-5",
                  notificationCount > 0 && !notificationOpen && "animate-pulse"
                )}
              />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full bg-destructive text-[10px] font-black text-white flex items-center justify-center ring-4 ring-background shadow-lg">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Component */}
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

          <div className="h-8 w-[1px] bg-border/60 mx-1 hidden sm:block" />

          {/* User Profile Trigger */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border bg-background/50 px-2 py-1.5 transition-all",
                userMenuOpen
                  ? "border-primary/40 bg-accent"
                  : "border-border hover:border-muted-foreground/30"
              )}
            >
              <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                <AvatarImage
                  src={profilePhotoUrl || ""}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary text-white text-[10px] font-bold">
                  {user.displayName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-xs font-bold text-foreground">
                  {user.displayName?.split(" ")[0]}
                </span>
                <span className="text-[9px] font-semibold text-muted-foreground/70 uppercase">
                  Member
                </span>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  userMenuOpen && "rotate-180"
                )}
              />
            </button>

            {/* User Menu Dropdown Content */}
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-3 w-64 rounded-[24px] border border-border/50 bg-popover/95 backdrop-blur-2xl shadow-2xl p-2 z-50"
                >
                  <div className="p-4 mb-2 bg-muted/40 rounded-2xl">
                    <p className="text-sm font-black truncate">
                      {user.displayName}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Link
                      href="/citizen/profile"
                      className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                    >
                      <User className="h-4 w-4" /> My Profile
                    </Link>
                    <Link
                      href="/citizen/settings"
                      className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                    >
                      <Settings className="h-4 w-4" /> Settings
                    </Link>
                    <div className="h-[1px] bg-border/40 my-1 mx-2" />
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-xs font-black text-destructive/80 hover:bg-destructive/10 rounded-xl transition-all"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}