"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListTodo, Calendar, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface StaffBottomNavProps {
  badgeCounts?: {
    queue?: number;
    messages?: number;
  };
}

export function StaffBottomNav({ badgeCounts }: StaffBottomNavProps) {
  const pathname = usePathname();
  
  const navs = [
    { href: "/staff/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/staff/queue", label: "Tasks", icon: ListTodo, badge: badgeCounts?.queue },
    { href: "/staff/schedule", label: "Schedule", icon: Calendar },
    { href: "/staff/messages", label: "Chat", icon: MessageSquare, badge: badgeCounts?.messages },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex justify-around items-center z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {navs.map((n) => {
        const active = pathname === n.href || pathname.startsWith(n.href + "/");
        return (
          <Link 
            key={n.href} 
            href={n.href} 
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 w-full h-full active:bg-gray-50 transition-colors",
              active ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <div className="relative">
              <n.icon className={cn("h-6 w-6", active && "fill-blue-100 stroke-blue-600")} />
              {n.badge ? (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {n.badge > 9 ? '9+' : n.badge}
                </span>
              ) : null}
            </div>
            <span className="text-[10px] font-medium">{n.label}</span>
          </Link>
        );
      })}
    </div>
  );
}