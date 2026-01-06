"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CurrentUser } from "@/lib/types/auth";
import { hasRole } from "@/lib/auth/role-helpers";
import { LayoutDashboard, ClipboardList, CalendarDays, MessageSquare, Menu } from "lucide-react";

export function StaffBottomNav({ user }: { user: CurrentUser }) {
  const pathname = usePathname();

  const items = [
    { name: "Home", href: "/staff/dashboard", icon: LayoutDashboard, roles: ["ward_staff", "dept_staff", "field_staff"] },
    { name: "Queue", href: "/staff/queue", icon: ClipboardList, roles: ["ward_staff", "dept_staff", "field_staff"] },
    { name: "Schedule", href: "/staff/schedule", icon: CalendarDays, roles: ["ward_staff", "dept_staff", "field_staff"] },
    { name: "Chat", href: "/staff/messages", icon: MessageSquare, roles: ["ward_staff", "dept_staff", "field_staff"] },
    { name: "More", href: "/staff/settings", icon: Menu, roles: ["ward_staff", "dept_staff", "field_staff"] },
  ].filter((i) => hasRole(user, i.roles));

  function isActive(href: string) {
    if (href === "/staff/dashboard") return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 glass-strong border-t border-border pb-safe">
      <div className="flex justify-around items-center px-2 py-2">
        {items.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${
                active ? "text-primary scale-105" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`relative p-1.5 rounded-lg transition-colors ${active ? "bg-primary/10" : "bg-transparent"}`}>
                <Icon className={`w-5 h-5 ${active ? "stroke-[2.5px]" : "stroke-2"}`} />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </div>
              <span className="text-[10px] font-medium tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}