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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";

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
    router.refresh();
  };

  const navigationItems = [
    { name: "Dashboard", href: "/citizen/dashboard", icon: Home },
    {
      name: "My Complaints",
      href: "/citizen/complaints",
      icon: FileText,
      badge: counts.complaints,
    },
    { name: "Ward Notices", href: "/citizen/notices", icon: Bell },
    { name: "Bills & Payments", href: "/citizen/payments", icon: Receipt },
    { name: "Services", href: "/citizen/services", icon: Briefcase },
    { name: "Profile", href: "/citizen/profile", icon: User },
  ];

  const isActive = (href: string) => {
    if (href === "/citizen/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  // Assumption: profile photo URL is stored on user.profile.profile_photo_url
  const profilePhotoUrl =
    user?.profile?.profile_photo_url ??
    user?.profile_photo_url ??
    user?.avatar_url ??
    null;

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-200 bg-white
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      aria-label="Citizen sidebar"
    >
      {/* Header / Branding */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-6">
        <Link
          href="/citizen/dashboard"
          className="group flex items-center gap-3"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/30 transition-all group-hover:scale-105 group-hover:shadow-blue-600/50">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold leading-tight text-gray-900 transition-colors group-hover:text-blue-700">
              Smart Pokhara
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Citizen Portal
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="rounded-lg p-1.5 text-gray-500 transition-all hover:bg-white hover:text-gray-700 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* User Card */}
      <div className="shrink-0 p-4">
        <div className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 shadow-sm transition-all hover:shadow-md">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity group-hover:opacity-100" />

          <Avatar className="relative h-12 w-12 ring-2 ring-white shadow-lg shadow-blue-500/20">
            <AvatarImage src={profilePhotoUrl || ""} alt={user.displayName} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-base font-bold text-white">
              {user?.displayName?.charAt(0)?.toUpperCase() || "C"}
            </AvatarFallback>
          </Avatar>

          <div className="relative min-w-0 flex-1">
            <p className="truncate text-sm font-bold leading-tight text-gray-900">
              {user.displayName}
            </p>

            {user.profile?.ward ? (
              <div className="mt-1 flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-blue-600" />
                <p className="text-xs font-semibold text-blue-700">
                  Ward {user.profile.ward.ward_number}
                </p>
              </div>
            ) : (
              <p className="mt-0.5 text-xs text-gray-500">Registered Citizen</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label="Primary">
        <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Menu
        </p>

        <div className="space-y-1.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`
                  group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-3 text-sm font-semibold
                  transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30
                  ${
                    active
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-gray-900"
                  }
                `}
              >
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 transition-opacity group-hover:opacity-100" />
                )}

                <Icon
                  className={`relative z-10 h-5 w-5 shrink-0 ${
                    active
                      ? "text-white"
                      : "text-gray-400 transition-transform group-hover:scale-110 group-hover:text-blue-600"
                  }`}
                />

                <div className="relative z-10 flex flex-1 items-center justify-between">
                  <span>{item.name}</span>

                  {item.badge && item.badge > 0 && (
                    <span className="animate-pulse rounded-full bg-white px-2 py-1 text-[10px] font-bold text-blue-600 shadow-sm ring-1 ring-blue-100">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer Actions */}
      <div className="shrink-0 space-y-1.5 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-blue-50/30 p-3">
        <Link
          href="/citizen/settings"
          onClick={() => setSidebarOpen(false)}
          className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-white hover:text-blue-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
        >
          <Settings className="h-4 w-4 text-gray-500 transition-all group-hover:rotate-90 group-hover:text-blue-600" />
          Settings
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 transition-all hover:bg-red-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20"
        >
          <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
