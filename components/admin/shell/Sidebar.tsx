"use client";

import { useState } from "react"; // ✅ ADD THIS
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  BarChart3,
  Megaphone,
  DollarSign,
  Settings,
  CheckSquare,
  Globe,
  MessageSquare,
  Shield,
  X,
  AlertTriangle,
  Radio,
  FolderKanban,
} from "lucide-react";
import type { CurrentUser } from "@/lib/types/auth";
import { cn } from "@/lib/utils";

interface NavigationItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string;
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Command Center",
    href: "/admin/command-center",
    icon: Radio,
    badge: "Live",
  },
  {
    name: "Complaints",
    href: "/admin/complaints",
    icon: FileText,
    children: [
      { name: "All Complaints", href: "/admin/complaints", icon: FileText },
      { name: "Map View", href: "/admin/complaints/map", icon: Globe },
      { name: "Assignment Rules", href: "/admin/complaints/rules", icon: Settings },
      { name: "SLA Monitor", href: "/admin/complaints/sla", icon: AlertTriangle },
    ],
  },
  {
    name: "Tasks",
    href: "/admin/tasks",
    icon: CheckSquare,
  },
  {
    name: "Content & Notices",
    href: "/admin/cms",
    icon: Globe,
    children: [
      { name: "CMS Pages", href: "/admin/cms", icon: Globe },
      { name: "Notices", href: "/admin/notices", icon: Megaphone },
      { name: "Media Library", href: "/admin/media", icon: FolderKanban },
    ],
  },
  {
    name: "Messaging",
    href: "/admin/messaging",
    icon: MessageSquare,
  },
  {
    name: "Payments",
    href: "/admin/payments",
    icon: DollarSign,
  },
  {
    name: "Users & Staff",
    href: "/admin/users",
    icon: Users,
    children: [
      { name: "All Users", href: "/admin/users", icon: Users },
      { name: "Citizens", href: "/admin/users/citizens", icon: Users },
      { name: "Staff", href: "/admin/users/staff", icon: Shield },
      { name: "Performance", href: "/admin/users/staff/performance", icon: BarChart3 },
    ],
  },
  {
    name: "Organization",
    href: "/admin/organization/departments",
    icon: Building2,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

interface AdminSidebarProps {
  user: CurrentUser;
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ user, open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "admin-sidebar",
        open && "open"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo & Close */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-green-700 text-sm font-bold text-white shadow-sm">
              SP
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Admin Portal
              </p>
              <p className="text-xs text-slate-500">Smart City Pokhara</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            Navigation
          </p>
          {navigation.map((item) => (
            <NavItem
              key={item.name}
              item={item}
              pathname={pathname}
              onItemClick={onClose}
            />
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-700 text-xs font-semibold text-white">
              {user.profile?.full_name?.charAt(0)?.toUpperCase() ||
                user.email?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {user.profile?.full_name || "Administrator"}
              </p>
              <p className="truncate text-xs text-slate-500">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  item,
  pathname,
  onItemClick,
}: {
  item: NavigationItem;
  pathname: string;
  onItemClick: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const isActive =
    pathname === item.href ||
    (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

  const Icon = item.icon;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isActive
              ? "bg-green-50 text-green-700 ring-1 ring-green-100"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5 flex-shrink-0",
              isActive
                ? "text-green-700"
                : "text-slate-400 group-hover:text-slate-600"
            )}
          />
          <span className="flex-1 truncate text-left">{item.name}</span>
          {item.badge && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
              {item.badge}
            </span>
          )}
          <svg
            className={cn(
              "h-4 w-4 transition-transform",
              expanded && "rotate-90"
            )}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        {expanded && (
          <div className="ml-6 mt-1 space-y-1 border-l-2 border-slate-200 pl-3">
            {item.children?.map((child) => {
              const ChildIcon = child.icon;
              const childActive = pathname === child.href;
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onItemClick}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    childActive
                      ? "text-green-700"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <ChildIcon className="h-4 w-4" />
                  <span>{child.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onItemClick}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-green-50 text-green-700 ring-1 ring-green-100"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5 flex-shrink-0",
          isActive
            ? "text-green-700"
            : "text-slate-400 group-hover:text-slate-600"
        )}
      />
      <span className="truncate">{item.name}</span>
      {item.badge && (
        <span className="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
