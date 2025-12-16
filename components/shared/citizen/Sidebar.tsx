// components/shared/citizen/Sidebar.tsx
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
  Phone,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  // UX Improvement: Grouped Navigation
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
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-200 bg-white
        transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      aria-label="Citizen sidebar"
    >
      {/* Branding */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 px-6 bg-gradient-to-r from-blue-50/50 to-white">
        <Link
          href="/citizen/dashboard"
          className="flex items-center gap-3 group"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md transition-transform group-hover:scale-105">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">
              Smart Pokhara
            </h1>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
              Citizen Portal
            </p>
          </div>
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1 text-gray-500 hover:bg-gray-100 rounded-md"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
        {navGroups.map((group) => (
          <div key={group.label}>
            <h3 className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-gray-400">
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
                    className={`
                      group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all
                      ${
                        active
                          ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-5 w-5 ${active ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`}
                      />
                      <span>{item.name}</span>
                    </div>
                    {item.badge > 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-blue-100 px-1.5 text-[10px] font-bold text-blue-700">
                              {item.badge > 99 ? "99+" : item.badge}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{item.badgeLabel || "New items"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="shrink-0 border-t border-gray-100 p-4 space-y-3 bg-gray-50/50">
        {/* Emergency Shortcut (New Feature) */}
        <Link
          href="/citizen/emergency"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 border border-red-100 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100 hover:border-red-200 transition-colors shadow-sm"
        >
          <AlertTriangle className="h-4 w-4" />
          Emergency Contacts
        </Link>

        {/* User Mini Profile */}
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white transition-colors">
          <Avatar className="h-9 w-9 border border-gray-200">
            <AvatarImage src={profilePhotoUrl || ""} />
            <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
              {user.displayName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {user.displayName}
            </p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}