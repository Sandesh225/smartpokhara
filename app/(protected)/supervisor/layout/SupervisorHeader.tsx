"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  Search,
  Bell,
  User,
  HelpCircle,
  Settings,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { useThemeMode } from "flowbite-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { GlobalSearch } from "../../../../components/supervisor/shared/GlobalSearch";
import { useSidebar } from "./SidebarContext";
import { Button } from "@/components/ui/button";

interface SupervisorHeaderProps {
  user: any;
  displayName: string;
  jurisdictionLabel: string;
  badgeCounts: { notifications: number };
}

export function SupervisorHeader({
  user,
  displayName,
  jurisdictionLabel,
  badgeCounts: initialBadgeCounts,
}: SupervisorHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showSearchMobile, setShowSearchMobile] = useState(false);
  const [badgeCounts, setBadgeCounts] = useState(initialBadgeCounts);
  const [mounted, setMounted] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();
  const { toggleMobile } = useSidebar();
  const { mode, toggleMode } = useThemeMode();

  // Ensure theme icons only render on client to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);

    // Close dropdown when clicking outside
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

  // Real-time Notification Listener
  useEffect(() => {
    const channel = supabase
      .channel("supervisor-notifs")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () =>
          setBadgeCounts((prev) => ({
            ...prev,
            notifications: prev.notifications + 1,
          }))
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id, supabase]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 lg:h-20 glass border-b border-border/50 transition-all duration-300">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* LEFT: Search & Mobile Toggle */}
        <div className="flex flex-1 items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobile}
            className="lg:hidden h-10 w-10 rounded-xl bg-card border border-border text-muted-foreground"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Desktop Global Search */}
          <div className="hidden md:block w-full max-w-md">
            <GlobalSearch userId={user.id} />
          </div>

          {/* Mobile Search Overlay */}
          <div className="md:hidden">
            {showSearchMobile ? (
              <div className="absolute inset-0 bg-background z-50 flex items-center px-4 animate-in fade-in slide-in-from-top-2">
                <GlobalSearch userId={user.id} autoFocus />
                <Button
                  variant="ghost"
                  onClick={() => setShowSearchMobile(false)}
                  className="ml-2 text-xs font-bold text-primary"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearchMobile(true)}
                className="h-10 w-10 rounded-xl border border-border bg-card text-muted-foreground"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* RIGHT: Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Jurisdiction Pill (High-End Badge) */}
          <div className="hidden xl:flex flex-col items-end mr-2">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">
              Authored Scope
            </span>
            <Badge
              variant="outline"
              className="bg-primary/5 text-primary border-primary/20 font-bold px-3 py-1 rounded-full flex items-center gap-1.5"
            >
              <ShieldCheck className="h-3 w-3" />
              {jurisdictionLabel}
            </Badge>
          </div>

          <div className="h-8 w-px bg-border/60 hidden md:block" />

          {/* THEME TOGGLE */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMode}
            className="h-10 w-10 rounded-xl border border-border bg-card text-muted-foreground hover:text-primary transition-all"
          >
            {!mounted ? (
              <div className="h-5 w-5 animate-pulse rounded-full bg-muted" />
            ) : mode === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Notifications Button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10 rounded-xl border transition-all",
                badgeCounts.notifications > 0
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-card"
              )}
            >
              <Bell
                className={cn(
                  "h-5 w-5 text-muted-foreground",
                  badgeCounts.notifications > 0 && "text-primary animate-pulse"
                )}
              />
              {badgeCounts.notifications > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full bg-destructive text-[10px] font-black text-white flex items-center justify-center ring-4 ring-background">
                  {badgeCounts.notifications}
                </span>
              )}
            </Button>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 rounded-2xl border border-transparent p-1 pr-2 hover:bg-muted/50 transition-all"
            >
              <div className="hidden flex-col items-end lg:flex">
                <span className="text-sm font-bold text-foreground truncate max-w-[150px]">
                  {displayName}
                </span>
                <span className="text-[10px] font-black text-primary uppercase tracking-tighter">
                  Supervisor Unit
                </span>
              </div>
              <Avatar className="h-9 w-9 border-2 border-primary/20 shadow-sm transition-transform active:scale-95">
                <AvatarImage src={user.profile?.profile_photo_url} />
                <AvatarFallback className="bg-primary text-primary-foreground font-black">
                  {displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform hidden sm:block",
                  userMenuOpen && "rotate-180"
                )}
              />
            </button>

            {/* Framer Motion Animated Menu */}
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "circOut" }}
                  className="absolute right-0 top-full mt-3 w-64 rounded-2xl border border-border bg-card p-2 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
                >
                  <div className="px-4 py-4 bg-muted/30 rounded-xl mb-2 border border-border/50">
                    <p className="text-sm font-black truncate text-foreground">
                      {displayName}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate font-medium">
                      {user.email}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/supervisor/profile"
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                    >
                      <User className="h-4 w-4" /> Account Profile
                    </Link>
                    <Link
                      href="/supervisor/settings"
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                    >
                      <Settings className="h-4 w-4" /> Portal Settings
                    </Link>
                    <Link
                      href="/help"
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all border-b border-border/50 pb-3 mb-1"
                    >
                      <HelpCircle className="h-4 w-4" /> Help & Support
                    </Link>

                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 px-3 py-3 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-all font-black"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>TERMINATE SESSION</span>
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