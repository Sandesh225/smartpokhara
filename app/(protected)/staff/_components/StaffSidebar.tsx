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
  ShieldCheck,
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
  const primaryRole = user.roles?.[0] || "Staff";

  // Navigation Data
  const SECTIONS = [
    {
      title: "Main",
      items: [
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
          name: "Performance",
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
      ],
    },
    {
      title: "Operations",
      items: [
        {
          name: "Team",
          href: "/staff/team",
          icon: Users,
          roles: ["ward_staff", "dept_staff", "field_staff", "dept_head"],
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
      ],
    },
    {
      title: "Support",
      items: [
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
          name: "Helpdesk",
          href: "/staff/helpdesk",
          icon: Phone,
          roles: ["call_center"],
        },
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
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop (Glass) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-stone-900/40 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container (Stone Panel) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border shadow-2xl lg:shadow-none transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header - Phewa Blue Gradient */}
        <div className="h-20 flex items-center justify-between px-6 bg-linear-to-r from-primary to-primary-dark relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 pattern-grid opacity-20" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight tracking-tight">
                Staff Portal
              </h1>
              <p className="text-blue-100 text-xs font-medium capitalize opacity-90">
                {primaryRole.replaceAll("_", " ")}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="h-[calc(100vh-5rem)] overflow-y-auto py-6 px-4 space-y-8">
          {SECTIONS.map((section) => {
            const visibleItems = section.items.filter((item) =>
              hasRole(user, item.roles)
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title}>
                <h3 className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                  {section.title}
                  <span className="h-px bg-border flex-1 ml-2 opacity-50" />
                </h3>

                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => onClose()}
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          active
                            ? "bg-primary/10 text-primary border-l-4 border-primary shadow-sm"
                            : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground hover:translate-x-1"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 transition-colors ${
                            active
                              ? "text-primary"
                              : "text-muted-foreground group-hover:text-foreground"
                          }`}
                        />
                        {item.name}
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