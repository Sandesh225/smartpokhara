// ============================================================================
// components/admin/shell/AdminShell.tsx
// ============================================================================

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Bell,
  MessageSquare,
  CreditCard,
  Users,
  Settings,
  BarChart3,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  LogOut,
  UserIcon,
  Shield,
  MapPin,
  Calendar,
  Zap,
  Search,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AdminShellUser = {
  full_name: string | null;
  email: string | null;
  avatar_url?: string | null;
  roleType?: string;
};

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  roles?: string[];
  badge?: number;
};

type NavSection = {
  section: string;
  items: NavItem[];
};

const navigationConfig: NavSection[] = [
  {
    section: "Overview",
    items: [
      {
        name: "Dashboard",
        icon: LayoutDashboard,
        href: "/admin/dashboard",
        roles: ["admin", "dept_head", "dept_staff"],
      },
      {
        name: "Analytics",
        icon: BarChart3,
        href: "/admin/analytics",
        roles: ["admin", "dept_head"],
      },
    ],
  },
  {
    section: "Complaints",
    items: [
      {
        name: "All Complaints",
        icon: FileText,
        href: "/admin/complaints",
        roles: ["admin", "dept_head", "dept_staff", "ward_staff"],
      },
      {
        name: "Map View",
        icon: MapPin,
        href: "/admin/complaints/map",
        roles: ["admin", "dept_head"],
      },
      {
        name: "Overdue",
        icon: FileText,
        href: "/admin/complaints?overdue=true",
        roles: ["admin", "dept_head"],
      },
    ],
  },
  {
    section: "Task Management",
    items: [
      {
        name: "Tasks",
        icon: CheckSquare,
        href: "/admin/tasks",
        roles: ["admin", "dept_head", "dept_staff", "field_staff"],
      },
      {
        name: "Calendar",
        icon: Calendar,
        href: "/admin/calendar",
        roles: ["admin", "dept_head"],
      },
    ],
  },
  {
    section: "Communication",
    items: [
      {
        name: "Messaging",
        icon: MessageSquare,
        href: "/admin/messaging",
        roles: ["admin", "dept_head", "call_center"],
      },
      {
        name: "Notifications",
        icon: Zap,
        href: "/admin/notifications",
        roles: ["admin"],
      },
    ],
  },
  {
    section: "Finance",
    items: [
      {
        name: "Payments",
        icon: CreditCard,
        href: "/admin/payments",
        roles: ["admin"],
      },
    ],
  },
  {
    section: "Administration",
    items: [
      {
        name: "Users & Staff",
        icon: Users,
        href: "/admin/staff",
        roles: ["admin"],
      },
      {
        name: "Settings",
        icon: Settings,
        href: "/admin/settings",
        roles: ["admin"],
      },
    ],
  },
];

const roleBadges: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  admin: {
    label: "Administrator",
    color: "text-red-700 dark:text-red-300",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
  dept_head: {
    label: "Department Head",
    color: "text-purple-700 dark:text-purple-300",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  dept_staff: {
    label: "Staff",
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  ward_staff: {
    label: "Ward Staff",
    color: "text-green-700 dark:text-green-300",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  field_staff: {
    label: "Field Staff",
    color: "text-orange-700 dark:text-orange-300",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
  call_center: {
    label: "Call Center",
    color: "text-teal-700 dark:text-teal-300",
    bgColor: "bg-teal-100 dark:bg-teal-900/30",
  },
};

function getRoleBadge(roleType?: string) {
  if (!roleType) {
    return roleBadges.admin;
  }
  return (
    roleBadges[roleType] ?? {
      label: roleType,
      color: "text-slate-700 dark:text-slate-300",
      bgColor: "bg-slate-100 dark:bg-slate-900/40",
    }
  );
}

export function AdminShell({
  user,
  children,
}: {
  user: AdminShellUser;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setIsDarkMode((prev) => !prev);
  };

  const roleType = user.roleType ?? "admin";
  const roleBadge = getRoleBadge(roleType);

  const filteredNavigation = navigationConfig
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.roles ? item.roles.includes(roleType) : true
      ),
    }))
    .filter((section) => section.items.length > 0);

  const initials = (user.full_name ?? "User")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  const currentNavItem =
    filteredNavigation
      .flatMap((s) => s.items)
      .find(
        (item) => pathname === item.href || pathname.startsWith(item.href + "/")
      ) ?? null;

  const pageTitle = currentNavItem?.name ?? "Admin Dashboard";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuOpen) {
        const target = e.target as HTMLElement;
        if (!target.closest("[data-user-menu]")) {
          setUserMenuOpen(false);
        }
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [userMenuOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 ease-in-out shadow-sm",
          sidebarOpen ? "w-64" : "w-[72px]"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/80 dark:border-slate-800">
          <div
            className={cn(
              "flex items-center gap-3 transition-opacity duration-200",
              sidebarOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
            )}
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
              <Shield className="h-5 w-5 text-white" />
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Smart City
              </span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Pokhara Metro
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors",
              !sidebarOpen && "mx-auto"
            )}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-6">
            {filteredNavigation.map((section) => (
              <div key={section.section}>
                {sidebarOpen && (
                  <h3 className="px-3 mb-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {section.section}
                  </h3>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/");

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                          isActive
                            ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                        )}
                        title={!sidebarOpen ? item.name : undefined}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
                        )}
                        <Icon
                          className={cn(
                            "h-5 w-5 flex-shrink-0 transition-colors",
                            isActive
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                          )}
                        />
                        {sidebarOpen && (
                          <span className="flex-1 text-sm font-medium truncate">
                            {item.name}
                          </span>
                        )}
                        {item.badge && sidebarOpen && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50 px-1.5 text-xs font-medium text-red-700 dark:text-red-300">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        {sidebarOpen && (
          <div className="p-3 border-t border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-md">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {user.full_name ?? "Admin User"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user.email ?? "admin@example.com"}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 shadow-2xl lg:hidden transition-transform duration-300 ease-in-out",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Smart City
              </span>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                Pokhara Metro
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-6">
            {filteredNavigation.map((section) => (
              <div key={section.section}>
                <h3 className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {section.section}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/");

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                          isActive
                            ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        )}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="flex-1 text-sm font-medium">
                          {item.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Mobile User Info */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold text-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {user.full_name ?? "Admin User"}
              </p>
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium mt-1",
                  roleBadge.bgColor,
                  roleBadge.color
                )}
              >
                {roleBadge.label}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
                {pageTitle}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Welcome back, {(user.full_name ?? "Admin").split(" ")[0]}
              </p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={toggleDarkMode}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
            </button>

            {/* User Menu */}
            <div className="relative" data-user-menu>
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold text-xs shadow-md">
                  {initials}
                </div>
                <ChevronDown
                  className={cn(
                    "hidden sm:block h-4 w-4 text-slate-400 transition-transform duration-200",
                    userMenuOpen && "rotate-180"
                  )}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-50">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {user.full_name ?? "Admin User"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {user.email ?? "admin@example.com"}
                    </p>
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium mt-2",
                        roleBadge.bgColor,
                        roleBadge.color
                      )}
                    >
                      {roleBadge.label}
                    </span>
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <UserIcon className="h-4 w-4 text-slate-400" />
                      My Profile
                    </button>
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Settings className="h-4 w-4 text-slate-400" />
                      Settings
                    </button>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-800 py-1">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await fetch("/api/auth/signout", {
                            method: "POST",
                          });

                          if (res.ok) {
                            window.location.href = "/login"; // hard redirect to reset all state
                          } else {
                            console.error("Failed to sign out");
                          }
                        } catch (err) {
                          console.error("Error during signout:", err);
                        }
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
