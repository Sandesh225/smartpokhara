"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Briefcase,
  FileText,
  Home,
  LogOut,
  MapPin,
  Receipt,
  Settings,
  User,
  X,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface SidebarProps {
  user: any;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  counts: { complaints: number; notifications: number };
}

export default function Sidebar({
  user,
  sidebarOpen,
  setSidebarOpen,
  counts,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

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

  const isActive = (href: string) => {
    if (href === "/citizen/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  const profilePhotoUrl = user?.profile?.profile_photo_url || user?.avatar_url;

  const navGroups = [
    {
      label: "Overview",
      items: [
        { name: "Dashboard", href: "/citizen/dashboard", icon: Home, badge: 0 },
        {
          name: "Ward Notices",
          href: "/citizen/notices",
          icon: Bell,
          badge: counts.notifications,
          badgeLabel: "Unread notices",
        },
      ],
    },
    {
      label: "Services",
      items: [
        {
          name: "My Complaints",
          href: "/citizen/complaints",
          icon: FileText,
          badge: counts.complaints,
          badgeLabel: "Active complaints",
        },
        {
          name: "Bills & Payments",
          href: "/citizen/payments",
          icon: Receipt,
          badge: 0,
        },
        {
          name: "Request Service",
          href: "/citizen/services",
          icon: Briefcase,
          badge: 0,
        },
      ],
    },
    {
      label: "Account",
      items: [
        { name: "My Profile", href: "/citizen/profile", icon: User, badge: 0 },
        {
          name: "Settings",
          href: "/citizen/settings",
          icon: Settings,
          badge: 0,
        },
      ],
    },
  ];

  return (
    <>
      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-80 flex-col border-r-2 border-border bg-card transition-transform duration-300 ease-in-out lg:translate-x-0 elevation-3 lg:elevation-2",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-20 sm:h-24 shrink-0 items-center justify-between px-6 border-b-2 border-border bg-gradient-to-r from-muted/40 to-muted/60">
          <Link
            href="/citizen/dashboard"
            className="flex items-center gap-3 group"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-secondary text-primary-foreground elevation-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight leading-none">
                Smart Pokhara
              </h1>
              <span className="text-xs font-bold text-primary uppercase tracking-wider mt-1 block">
                Citizen Portal
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2.5 text-muted-foreground hover:bg-accent hover:text-foreground rounded-xl transition-all duration-200 active:scale-90"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-hide">
          {navGroups.map((group) => (
            <div key={group.label}>
              <h3 className="mb-4 px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {group.label}
              </h3>
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "group relative flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-semibold transition-all duration-200",
                        active
                          ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground elevation-2 scale-[1.02]"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground hover:scale-[1.01]"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            "h-5 w-5 transition-all duration-200",
                            active
                              ? "text-primary-foreground scale-110"
                              : "text-muted-foreground/70 group-hover:text-primary group-hover:scale-110"
                          )}
                        />
                        <span>{item.name}</span>
                      </div>

                      {item.badge > 0 ? (
                        <span
                          className={cn(
                            "flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-2 text-xs font-mono font-bold tabular-nums elevation-1",
                            active
                              ? "bg-primary-foreground/25 text-primary-foreground ring-2 ring-primary-foreground/20"
                              : "bg-primary/15 text-primary ring-2 ring-primary/20"
                          )}
                          aria-label={item.badgeLabel || `${item.badge} items`}
                        >
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      ) : (
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 opacity-0 transition-all duration-200 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0",
                            active && "hidden"
                          )}
                        />
                      )}

                      {/* Active Indicator */}
                      {active && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute left-0 w-1.5 h-10 bg-primary-foreground rounded-r-full"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Panel */}
        <div className="p-4 border-t-2 border-border bg-gradient-to-r from-muted/40 to-muted/60">
          {/* Emergency Alert */}
          <Link
            href="/citizen/emergency"
            onClick={() => setSidebarOpen(false)}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-destructive/15 border-2 border-destructive/30 px-4 py-3.5 text-sm font-bold text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-200 elevation-1 mb-4 group"
          >
            <AlertTriangle className="h-5 w-5 group-hover:animate-pulse" />
            <span className="tracking-wider">EMERGENCY LINE</span>
          </Link>

          {/* User Profile Card */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-background border-2 border-border elevation-1">
            <Avatar className="h-11 w-11 border-2 border-muted shadow-sm ring-4 ring-background">
              <AvatarImage src={profilePhotoUrl || ""} alt={user.displayName} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold text-base">
                {user.displayName?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-bold text-foreground leading-tight">
                {user.displayName}
              </p>
              <p className="truncate text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-wider">
                {user.roleName || "Citizen"}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/15 rounded-lg transition-all duration-200 active:scale-90"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>

          {/* Verified Badge */}
          <div className="mt-4 text-center">
            <span className="text-xs font-bold text-muted-foreground flex items-center justify-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-primary tracking-wider">
                VERIFIED CITIZEN
              </span>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}