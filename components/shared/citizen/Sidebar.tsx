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
    await supabase.auth.signOut();
    router.push("/login");
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
      {/* Mobile Overlay - Glass Effect */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[rgb(26,32,44)]/30 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Stone (Trust) Element */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[rgb(229,231,235)] bg-white transition-all duration-300 ease-in-out lg:translate-x-0 elevation-4",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Branding Header - Consistent Spacing */}
        <div className="flex h-20 shrink-0 items-center justify-between px-6 border-b border-[rgb(229,231,235)] bg-[rgb(249,250,251)]">
          <Link
            href="/citizen/dashboard"
            className="flex items-center gap-3 group"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgb(43,95,117)] text-white shadow-lg transition-transform group-hover:scale-105">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[rgb(26,32,44)] tracking-tight leading-none">
                Smart Pokhara
              </h1>
              <span className="text-[10px] font-bold text-[rgb(43,95,117)] uppercase tracking-wider mt-0.5 block">
                Citizen Portal
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-[rgb(107,114,128)] hover:bg-[rgb(249,250,251)] hover:text-[rgb(26,32,44)] rounded-xl transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Section - Consistent Spacing */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-hide">
          {navGroups.map((group) => (
            <div key={group.label}>
              <h3 className="mb-3 px-4 text-[10px] font-bold uppercase tracking-widest text-[rgb(107,114,128)]">
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "group relative flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                        active
                          ? "bg-[rgb(43,95,117)] text-white shadow-md"
                          : "text-[rgb(107,114,128)] hover:bg-[rgb(249,250,251)] hover:text-[rgb(26,32,44)]"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            "h-5 w-5 transition-colors",
                            active
                              ? "text-white"
                              : "text-[rgb(156,163,175)] group-hover:text-[rgb(43,95,117)]"
                          )}
                        />
                        <span>{item.name}</span>
                      </div>

                      {item.badge > 0 ? (
                        <span
                          className={cn(
                            "flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-2 text-[10px] font-mono font-bold tabular-nums",
                            active
                              ? "bg-white/20 text-white"
                              : "bg-[rgb(43,95,117)]/10 text-[rgb(43,95,117)]"
                          )}
                          aria-label={item.badgeLabel || `${item.badge} items`}
                        >
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      ) : (
                        <ChevronRight
                          className={cn(
                            "h-3.5 w-3.5 opacity-0 transition-all -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0",
                            active ? "hidden" : "block text-[rgb(209,213,219)]"
                          )}
                        />
                      )}

                      {/* Active Indicator */}
                      {active && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute left-0 w-1 h-8 bg-white rounded-r-full"
                          transition={{
                            type: "spring",
                            stiffness: 380,
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

        {/* Bottom Panel - Stone Card with Consistent Padding */}
        <div className="p-4 border-t border-[rgb(229,231,235)] bg-[rgb(249,250,251)]">
          {/* Emergency Alert - Highlight Tech Color */}
          <Link
            href="/citizen/emergency"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[rgb(229,121,63)]/10 border border-[rgb(229,121,63)]/20 px-4 py-3 text-xs font-bold text-[rgb(229,121,63)] hover:bg-[rgb(229,121,63)] hover:text-white hover:border-[rgb(229,121,63)] transition-all duration-200 shadow-sm mb-4"
          >
            <AlertTriangle className="h-4 w-4" />
            EMERGENCY LINE
          </Link>

          {/* User Profile Card - Stone Element */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[rgb(229,231,235)] shadow-sm">
            <Avatar className="h-10 w-10 border-2 border-[rgb(244,245,247)] shadow-sm">
              <AvatarImage src={profilePhotoUrl || ""} alt={user.displayName} />
              <AvatarFallback className="bg-[rgb(43,95,117)] text-white font-bold text-sm">
                {user.displayName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-bold text-[rgb(26,32,44)] leading-tight">
                {user.displayName}
              </p>
              <p className="truncate text-[10px] font-medium text-[rgb(107,114,128)] mt-0.5">
                {user.roleName || "Citizen"}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-[rgb(156,163,175)] hover:text-[rgb(239,68,68)] hover:bg-[rgb(239,68,68)]/5 rounded-lg transition-all"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Verified Badge */}
          <div className="mt-3 text-center">
            <span className="text-[10px] font-bold text-[rgb(107,114,128)] flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3 w-3" /> VERIFIED CITIZEN
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
