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
  Phone,
  X,
  ShieldCheck,
  Sparkles,
  PlaneTakeoff,
  GraduationCap,
  Settings,
  Clock,
} from "lucide-react";

interface StaffSidebarProps {
  user: CurrentUser;
  isOpen: boolean;
  onClose: () => void;
}

/* Active route matcher */
function isActive(pathname: string, href: string) {
  if (href === "/staff/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export function StaffSidebar({ user, isOpen, onClose }: StaffSidebarProps) {
  const pathname = usePathname();
  const primaryRole = user.roles?.[0] ?? "staff";

  const SECTIONS = [
    {
      title: "Main",
      items: [
        {
          name: "Dashboard",
          href: "/staff/dashboard",
          icon: LayoutDashboard,
          roles: ["ward_staff", "dept_staff", "field_staff", "dept_head", "call_center"],
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
          roles: ["ward_staff", "dept_staff", "field_staff", "dept_head", "call_center"],
        },
        {
          name: "Schedule",
          href: "/staff/schedule",
          icon: CalendarDays,
          roles: ["ward_staff", "dept_staff", "field_staff", "dept_head", "call_center"],
        },
        {
          name: "Performance",
          href: "/staff/performance",
          icon: BarChart3,
          roles: ["ward_staff", "dept_staff", "field_staff", "dept_head"],
        },
        {
          name: "Messages",
          href: "/staff/messages",
          icon: MessageSquare,
          roles: ["ward_staff", "dept_staff", "field_staff", "dept_head", "call_center"],
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
          roles: ["dept_staff", "dept_head"],
        },
        {
          name: "Leave",
          href: "/staff/leave",
          icon: PlaneTakeoff,
          roles: ["ward_staff", "dept_staff", "field_staff", "dept_head", "call_center"],
        },
        {
          name: "Training",
          href: "/staff/training",
          icon: GraduationCap,
          roles: ["ward_staff", "dept_staff", "field_staff", "dept_head"],
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
          roles: ["ward_staff", "dept_staff", "field_staff", "dept_head", "call_center"],
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
          roles: ["ward_staff", "dept_staff", "field_staff", "dept_head", "call_center"],
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="h-20 px-6 flex items-center justify-between bg-gradient-to-br from-primary to-primary/90">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white shadow">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">
                Staff Portal
              </h1>
              <p className="text-xs text-white/80 capitalize">
                {primaryRole.replaceAll("_", " ")}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden text-white/90 hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="h-[calc(100vh-5rem)] overflow-y-auto px-4 py-6 space-y-8">
          {SECTIONS.map((section) => {
            const visibleItems = section.items.filter((item) =>
              hasRole(user, item.roles)
            );

            if (!visibleItems.length) return null;

            return (
              <div key={section.title}>
                <h3 className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Sparkles className="w-3 h-3 opacity-50" />
                  {section.title}
                  <span className="flex-1 h-px bg-border ml-2" />
                </h3>

                <div className="space-y-1.5">
                  {visibleItems.map((item) => {
                    const active = isActive(pathname, item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={onClose}
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          active
                            ? "bg-primary/10 text-primary border-l-4 border-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            active ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                        <span className="flex-1">{item.name}</span>
                        {active && (
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-border bg-muted/30">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Online & Active
          </div>
        </div>
      </aside>
    </>
  );
}
