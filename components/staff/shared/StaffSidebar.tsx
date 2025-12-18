"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListTodo,
  Calendar,
  MessageSquare,
  BarChart2,
  Settings,
  LogOut,
  Loader2,
  HelpCircle,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";

interface StaffSidebarProps {
  user: any;
  badgeCounts: {
    queue: number;
    messages: number;
  };
  onLogout: () => void;
  isLoggingOut: boolean;
}

export function StaffSidebar({
  user,
  badgeCounts,
  onLogout,
  isLoggingOut,
}: StaffSidebarProps) {
  const pathname = usePathname();

  const MENU_ITEMS = [
    { href: "/staff/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/staff/queue", label: "My Tasks", icon: ListTodo, badge: badgeCounts.queue },
    { href: "/staff/schedule", label: "Schedule", icon: Calendar },
    { href: "/staff/messages", label: "Messages", icon: MessageSquare, badge: badgeCounts.messages },
    { href: `/staff/${user.user_id}/performance`, label: "My Performance", icon: BarChart2 },
  ];

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header / Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            SP
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-none">Smart Pokhara</h1>
            <p className="text-[10px] font-medium text-gray-500 mt-0.5 uppercase tracking-wide">Staff Portal</p>
          </div>
        </div>
      </div>

      {/* User Info Snippet */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 border border-white shadow-sm flex items-center justify-center overflow-hidden">
             {user.avatar_url ? (
               <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
             ) : (
               <User className="h-5 w-5 text-gray-400" />
             )}
          </div>
          <div className="flex-1 min-w-0">
             <p className="text-sm font-semibold text-gray-900 truncate">{user.full_name}</p>
             <div className="flex items-center gap-2 mt-0.5">
               <StatusBadge status={user.availability_status} />
             </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-white" : "text-gray-400 group-hover:text-gray-500")} />
                <span>{item.label}</span>
              </div>
              {item.badge ? (
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold",
                  isActive ? "bg-white/20 text-white" : "bg-red-100 text-red-700"
                )}>
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
        
        <div className="pt-6 mt-2 border-t border-gray-100">
           <Link
              href="/staff/help"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <HelpCircle className="h-5 w-5 text-gray-400" />
              <span>Help & Support</span>
            </Link>
            <Link
              href="/staff/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-5 w-5 text-gray-400" />
              <span>Settings</span>
            </Link>
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all disabled:opacity-50"
        >
          {isLoggingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
          <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
        </button>
      </div>
    </div>
  );
}