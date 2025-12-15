"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CurrentUser } from "@/lib/types/auth";
import { hasRole } from "@/lib/auth/role-helpers";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  BarChart3,
  MessageSquare,
  Users,
  BookOpen,
  LifeBuoy,
  Bell,
  Clock,
  PlaneTakeoff,
  GraduationCap,
  Settings,
  Phone,
  X,
} from "lucide-react";

interface StaffSidebarProps {
  user: CurrentUser;
  isOpen: boolean;
  onClose: () => void;
}

type NavItem = {
  name: string;
  href: string;
  icon: any;
  roles: string[];
};

function isActivePath(pathname: string, href: string) {
  if (href === "/staff/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export function StaffSidebar({ user, isOpen, onClose }: StaffSidebarProps) {
  const pathname = usePathname();

  // ✅ Keep your role names exactly as-is. No helper changes needed.
  const MAIN: NavItem[] = [
    {
      name: "Dashboard",
      href: "/staff/dashboard",
      icon: LayoutDashboard,
      roles: [
        "ward_staff",
        "dept_staff",
        "field_staff",
        "dept_head",
        "call_center",
      ],
    },
    {
      name: "My Queue",
      href: "/staff/queue",
      icon: ClipboardList,
      roles: ["ward_staff", "dept_staff", "field_staff", "dept_head"],
    },
    {
      name: "My Schedule",
      href: "/staff/schedule",
      icon: CalendarDays,
      roles: [
        "ward_staff",
        "dept_staff",
        "field_staff",
        "dept_head",
        "call_center",
      ],
    },
    {
      name: "My Performance",
      href: "/staff/performance",
      icon: BarChart3,
      roles: [
        "ward_staff",
        "dept_staff",
        "field_staff",
        "dept_head",
        "call_center",
      ],
    },
    {
      name: "Messages",
      href: "/staff/messages",
      icon: MessageSquare,
      roles: [
        "ward_staff",
        "dept_staff",
        "field_staff",
        "dept_head",
        "call_center",
      ],
    },
  ];

  const COLLAB: NavItem[] = [
    {
      name: "My Team",
      href: "/staff/team",
      icon: Users,
      roles: ["ward_staff", "dept_staff", "field_staff", "dept_head"],
    },
    {
      name: "Resources",
      href: "/staff/resources",
      icon: BookOpen,
      roles: [
        "ward_staff",
        "dept_staff",
        "field_staff",
        "dept_head",
        "call_center",
      ],
    },
    {
      name: "Help",
      href: "/staff/help",
      icon: LifeBuoy,
      roles: [
        "ward_staff",
        "dept_staff",
        "field_staff",
        "dept_head",
        "call_center",
      ],
    },
  ];

  const OPS: NavItem[] = [
    {
      name: "Notifications",
      href: "/staff/notifications",
      icon: Bell,
      roles: [
        "ward_staff",
        "dept_staff",
        "field_staff",
        "dept_head",
        "call_center",
      ],
    },
    {
      name: "Attendance",
      href: "/staff/attendance",
      icon: Clock,
      roles: [
        "ward_staff",
        "dept_staff",
        "field_staff",
        "dept_head",
        "call_center",
      ],
    },
    {
      name: "Leave",
      href: "/staff/leave",
      icon: PlaneTakeoff,
      roles: [
        "ward_staff",
        "dept_staff",
        "field_staff",
        "dept_head",
        "call_center",
      ],
    },
    {
      name: "Training",
      href: "/staff/training",
      icon: GraduationCap,
      roles: [
        "ward_staff",
        "dept_staff",
        "field_staff",
        "dept_head",
        "call_center",
      ],
    },
  ];

  const SPECIAL: NavItem[] = [
    {
      name: "Helpdesk",
      href: "/staff/helpdesk",
      icon: Phone,
      roles: ["call_center"],
    },
  ];

  const ACCOUNT: NavItem[] = [
    {
      name: "Settings",
      href: "/staff/settings",
      icon: Settings,
      roles: [
        "ward_staff",
        "dept_staff",
        "field_staff",
        "dept_head",
        "call_center",
      ],
    },
  ];

  const sections = [
    { title: "Main", items: MAIN },
    { title: "Collaboration", items: COLLAB },
    { title: "Operations", items: OPS },
    { title: "Special", items: SPECIAL },
    { title: "Account", items: ACCOUNT },
  ];

  const primaryRole =
    user.roles && user.roles.length > 0 ? user.roles[0] : "staff";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:shadow-none border-r border-gray-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Sidebar"
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm text-white font-bold text-base shadow-lg">
              SP
            </div>
            <div>
              <p className="text-sm font-bold text-white">Staff Portal</p>
              <p className="text-xs text-blue-100 capitalize font-medium">
                {String(primaryRole).replaceAll("_", " ")}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden rounded-lg p-2 text-white/80 hover:bg-white/20 hover:text-white transition-colors active:scale-95"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="h-[calc(100vh-4rem)] overflow-y-auto px-4 py-6 bg-gradient-to-b from-gray-50/50 to-white">
          {sections.map((section) => {
            const visibleItems = section.items.filter((item) =>
              hasRole(user, item.roles)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="mb-8 last:mb-0">
                <p className="px-3 pb-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                  <span className="h-px flex-1 bg-gradient-to-r from-gray-300 to-transparent" />
                  {section.title}
                </p>

                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActivePath(pathname, item.href);

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={onClose}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${
                          active
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:scale-[0.98]"
                        }`}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon
                          className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                            active
                              ? "text-white"
                              : "text-gray-500 group-hover:text-gray-700"
                          }`}
                        />
                        <span className="truncate">{item.name}</span>

                        {/* Badge hooks (optional later)
                        {item.name === "Messages" && (
                          <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                            3
                          </span>
                        )}
                        */}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
