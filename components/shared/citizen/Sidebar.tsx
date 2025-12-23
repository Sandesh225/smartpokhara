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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion"; // IMPORTANT: Ensure this is imported

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
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r-2 border-slate-100 bg-white transition-all duration-500 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        {/* Branding Header */}
        <div className="flex h-20 shrink-0 items-center justify-between px-6 bg-slate-50/50 border-b border-slate-100">
          <Link
            href="/citizen/dashboard"
            className="flex items-center gap-3 group"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 transition-transform group-hover:scale-110">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 tracking-tight leading-none">
                Smart Pokhara
              </h1>
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.15em] mt-1 block">
                Citizen Portal
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:bg-white hover:text-slate-900 rounded-xl transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-10 scrollbar-hide">
          {navGroups.map((group) => (
            <div key={group.label}>
              <h3 className="mb-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
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
                        "group relative flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300",
                        active
                          ? "bg-blue-600 text-white shadow-xl shadow-blue-100 ring-1 ring-blue-500"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            "h-5 w-5 transition-colors",
                            active
                              ? "text-white"
                              : "text-slate-400 group-hover:text-blue-600"
                          )}
                        />
                        <span>{item.name}</span>
                      </div>

                      {item.badge > 0 ? (
                        <span
                          className={cn(
                            "flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-black",
                            active
                              ? "bg-white/20 text-white"
                              : "bg-blue-50 text-blue-600"
                          )}
                        >
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      ) : (
                        <ChevronRight
                          className={cn(
                            "h-3 w-3 opacity-0 transition-all -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0",
                            active ? "hidden" : "block text-slate-300"
                          )}
                        />
                      )}

                      {/* Hover Indicator Line */}
                      {active && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
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
        <div className="p-4 bg-slate-50/80 border-t border-slate-100">
          {/* Emergency Alert Shortcut */}
          <Link
            href="/citizen/emergency"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 border-2 border-red-100 px-4 py-3 text-xs font-black text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 shadow-sm mb-4"
          >
            <AlertTriangle className="h-4 w-4" />
            EMERGENCY LINE
          </Link>

          <div className="flex items-center gap-3 p-2 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <Avatar className="h-10 w-10 border-2 border-slate-50 shadow-sm">
              <AvatarImage src={profilePhotoUrl || ""} />
              <AvatarFallback className="bg-blue-600 text-white font-black text-xs">
                {user.displayName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-black text-slate-900 uppercase tracking-tight">
                {user.displayName}
              </p>
              <p className="truncate text-[10px] font-bold text-slate-400">
                {user.roleName || "Citizen"}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              title="End Session"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 text-center">
            <span className="text-[9px] font-bold text-slate-300 flex items-center justify-center gap-1">
              <ShieldCheck className="h-3 w-3" /> VERIFIED CITIZEN
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
