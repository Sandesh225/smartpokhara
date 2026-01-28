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
  Sparkles,
} from "lucide-react";
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
        success: "Signed out successfully!",
        error: "Error signing out",
      }
    );
  };

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  if (!mounted) return null;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 h-20 w-full border-b-2 border-border/60 bg-card/80 backdrop-blur-2xl shadow-sm"
    >
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <div className="flex flex-1 items-center gap-4 sm:gap-6 max-w-2xl">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden h-11 w-11 flex items-center justify-center rounded-2xl border-2 border-border bg-background hover:border-primary transition-all shadow-sm"
          >
            <Menu className="h-5 w-5 text-foreground" />
          </motion.button>

          <div
            className={cn(
              "hidden sm:flex flex-1 items-center rounded-2xl border-2 transition-all duration-300 shadow-sm overflow-hidden",
              searchFocused
                ? "border-primary bg-background ring-4 ring-primary/10 shadow-lg"
                : "border-border bg-muted/30 hover:border-border/80"
            )}
          >
            <Search
              className={cn(
                "ml-4 h-5 w-5 transition-colors shrink-0",
                searchFocused ? "text-primary" : "text-muted-foreground"
              )}
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search services, complaints, bills..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full bg-transparent px-3 py-3 text-sm outline-none font-medium placeholder:text-muted-foreground/60"
            />
            <kbd className="mr-4 hidden items-center gap-1 rounded-lg border-2 border-border bg-background px-2 py-1 text-[10px] font-bold text-muted-foreground lg:flex shadow-sm">
              <Command className="h-3 w-3" />K
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="h-11 w-11 flex items-center justify-center rounded-2xl border-2 border-border bg-background hover:border-primary transition-all shadow-sm"
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div
                  key="sun"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="h-5 w-5 text-amber-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ scale: 0, rotate: 90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="h-5 w-5 text-primary" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <div className="relative" ref={notificationRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setNotificationOpen(!notificationOpen)}
              className={cn(
                "h-11 w-11 flex items-center justify-center rounded-2xl border-2 transition-all relative shadow-sm",
                notificationOpen
                  ? "border-primary bg-primary/10 text-primary shadow-lg ring-4 ring-primary/10"
                  : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
              )}
            >
              <Bell
                className={cn(
                  "h-5 w-5 transition-all",
                  notificationCount > 0 && !notificationOpen && "animate-pulse"
                )}
              />
              <AnimatePresence>
                {notificationCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-[10px] font-black text-white flex items-center justify-center ring-4 ring-background shadow-lg"
                  >
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

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

          <div className="h-8 w-[2px] bg-gradient-to-b from-transparent via-border to-transparent mx-1 hidden sm:block" />

          <div className="relative" ref={userMenuRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={cn(
                "flex items-center gap-2 sm:gap-3 rounded-2xl border-2 bg-background/50 px-2 py-1.5 transition-all shadow-sm",
                userMenuOpen
                  ? "border-primary/60 bg-accent shadow-lg ring-4 ring-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-muted/50"
              )}
            >
              <Avatar className="h-9 w-9 border-2 border-background shadow-md ring-2 ring-border/50">
                <AvatarImage
                  src={profilePhotoUrl || ""}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-sm font-black">
                  {user.displayName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start leading-tight min-w-0">
                <span className="text-sm font-bold text-foreground truncate max-w-[120px]">
                  {user.displayName?.split(" ")[0]}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5" />
                  {user.roleName}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-300",
                  userMenuOpen && "rotate-180"
                )}
              />
            </motion.button>

            <AnimatePresence>
              {userMenuOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-3 w-72 rounded-3xl border-2 border-border/80 bg-card backdrop-blur-2xl shadow-2xl p-3 z-50"
                  >
                    <div className="p-5 mb-3 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl border-2 border-border/50">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-12 w-12 border-2 border-background shadow-md">
                          <AvatarImage src={profilePhotoUrl || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-black">
                            {user.displayName?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black truncate text-foreground">
                            {user.displayName}
                          </p>
                          <p className="text-xs text-muted-foreground font-semibold truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-1.5 bg-background/80 rounded-lg border border-border/50">
                          {user.roleName}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Link
                        href="/citizen/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-2xl transition-all group"
                      >
                        <User className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        My Profile
                      </Link>
                      <Link
                        href="/citizen/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-2xl transition-all group"
                      >
                        <Settings className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                        Settings
                      </Link>
                      <div className="h-[2px] bg-gradient-to-r from-transparent via-border to-transparent my-2" />
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleSignOut();
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-black text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-2xl transition-all group"
                      >
                        <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
}