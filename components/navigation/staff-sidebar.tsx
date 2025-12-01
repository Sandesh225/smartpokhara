// components/navigation/staff-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  MapPin,
  Phone,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface StaffSidebarProps {
  user: any;
}

const navigation = {
  common: [
    { name: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
    { name: "My Tasks", href: "/staff/tasks", icon: FileText },
    { name: "Calendar", href: "/staff/calendar", icon: Calendar },
    { name: "Reports", href: "/staff/reports", icon: BarChart3 },
  ],
  ward: [
    { name: "Ward Map", href: "/staff/ward/map", icon: MapPin },
    { name: "Residents", href: "/staff/ward/residents", icon: Users },
  ],
  dept: [
    { name: "Department", href: "/staff/department", icon: Users },
    { name: "Team", href: "/staff/team", icon: Users },
  ],
  field: [
    {
      name: "Field Assignments",
      href: "/staff/field/assignments",
      icon: MapPin,
    },
    { name: "Schedule", href: "/staff/field/schedule", icon: Calendar },
  ],
  helpdesk: [
    { name: "Calls", href: "/staff/helpdesk/calls", icon: Phone },
    { name: "Tickets", href: "/staff/helpdesk/tickets", icon: FileText },
  ],
  supervisor: [
    { name: "Team Management", href: "/staff/management/team", icon: Users },
    { name: "Analytics", href: "/staff/management/analytics", icon: BarChart3 },
  ],
};

export function StaffSidebar({ user }: StaffSidebarProps) {
  const pathname = usePathname();
  const supabase = createClient();

  const getRoleSpecificNav = () => {
    if (user.roles.includes("ward_staff")) return navigation.ward;
    if (user.roles.includes("dept_staff") || user.roles.includes("dept_head"))
      return navigation.dept;
    if (user.roles.includes("field_staff")) return navigation.field;
    if (user.roles.includes("call_center")) return navigation.helpdesk;
    if (user.roles.includes("admin") || user.roles.includes("dept_head"))
      return navigation.supervisor;
    return [];
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const navItems = [...navigation.common, ...getRoleSpecificNav()];

  return (
    <div className="flex h-full w-64 flex-col fixed inset-y-0 z-50 bg-white border-r">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b">
        <Link href="/staff/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SC</span>
          </div>
          <span className="font-semibold">Staff Portal</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-4 pb-4">
        <div className="mt-6 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive
                      ? "text-blue-700"
                      : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Settings */}
        <div className="mt-auto space-y-1">
          <Link
            href="/staff/settings"
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/staff/settings"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Settings className="h-4 w-4 text-gray-400 group-hover:text-gray-500" />
            Settings
          </Link>

          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-start gap-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </nav>
    </div>
  );
}