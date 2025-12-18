// components/navigation/admin-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Building2,
  BarChart3,
  Settings,
  Megaphone,
  Shield,
} from "lucide-react";
import type { CurrentUser } from "@/lib/types/auth";
import { cn } from "@/lib/utils";

interface NavigationItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Complaints", href: "/admin/complaints", icon: FileText },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Departments", href: "/admin/departments", icon: Building2 },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Notices", href: "/admin/notices", icon: Megaphone },
  { name: "Audit Logs", href: "/admin/audit", icon: Shield },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  user: CurrentUser;
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden border-r border-slate-200 bg-white lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-blue-700 to-blue-900 text-sm font-semibold text-white shadow-sm">
              SP
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Admin Panel
              </p>
              <p className="text-xs text-slate-500">Smart City Pokhara</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="px-3 pb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            Navigation
          </p>
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" &&
                pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive
                      ? "text-blue-700"
                      : "text-slate-400 group-hover:text-slate-600"
                  )}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-xs font-semibold text-white">
              {user.profile?.full_name?.charAt(0)?.toUpperCase() ||
                user.email?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {user.profile?.full_name || "Administrator"}
              </p>
              <p className="truncate text-xs text-slate-500">
                System Administrator
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
