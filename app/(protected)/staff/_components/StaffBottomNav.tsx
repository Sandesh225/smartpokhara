"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CurrentUser } from "@/lib/types/auth";
import {
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  User,
  Bell,
} from "lucide-react";

interface StaffBottomNavProps {
  user: CurrentUser;
}

const navItems = [
  {
    name: "Dashboard",
    href: "/staff/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Queue",
    href: "/staff/queue",
    icon: ClipboardList,
  },
  {
    name: "Messages",
    href: "/staff/messages",
    icon: MessageSquare,
  },
  {
    name: "Notifications",
    href: "/staff/notifications",
    icon: Bell,
  },
  {
    name: "Profile",
    href: "/staff/settings",
    icon: User,
  },
];

export function StaffBottomNav({ user }: StaffBottomNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/staff/dashboard") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      {/* Glass Background with Enhanced Dark Mode */}
      <div className="glass border-t border-border bg-card/95 dark:bg-card/90 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 h-full group"
              >
                <div
                  className={`relative flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                    active ? "scale-105" : "scale-100"
                  }`}
                >
                  {/* Icon Container with Enhanced States */}
                  <div
                    className={`relative p-2 rounded-xl transition-all duration-200 ${
                      active
                        ? "bg-primary/15 dark:bg-primary/25"
                        : "bg-transparent group-hover:bg-muted dark:group-hover:bg-muted/50"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 transition-colors duration-200 ${
                        active
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    />
                    
                    {/* Active Indicator Dot */}
                    {active && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
                    )}

                    {/* Notification Badge for Bell */}
                    {item.name === "Notifications" && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive border-2 border-card rounded-full" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[10px] font-medium transition-colors duration-200 ${
                      active
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    {item.name}
                  </span>

                  {/* Active Underline */}
                  {active && (
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}