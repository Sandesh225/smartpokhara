"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CurrentUser } from "@/lib/types/auth";
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Search,
  Map,
  CreditCard,
  Bell,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CitizenSidebarProps {
  user: CurrentUser;
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/citizen/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "New Complaint",
    href: "/citizen/complaints/new",
    icon: PlusCircle,
  },
  {
    name: "My Complaints",
    href: "/citizen/complaints",
    icon: FileText,
  },
  {
    name: "Track Status",
    href: "/citizen/track",
    icon: Search,
  },
  {
    name: "Ward Info",
    href: "/citizen/ward",
    icon: Map,
  },
  {
    name: "Payments",
    href: "/citizen/payments",
    icon: CreditCard,
  },
  {
    name: "Notifications",
    href: "/citizen/notifications",
    icon: Bell,
  },
  {
    name: "Profile",
    href: "/citizen/profile",
    icon: User,
  },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function CitizenSidebar({ user, isOpen, onClose }: CitizenSidebarProps) {
  const pathname = usePathname();
  const displayName = user.profile?.full_name || user.email.split("@")[0];

  const content = (
    <div className="flex h-full flex-col overflow-y-auto border-r border-slate-200 bg-white">
      {/* Mobile Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white">
            SP
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Citizen Portal
            </p>
            <p className="text-xs text-slate-500">Smart City</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Desktop Logo */}
      <div className="hidden h-16 shrink-0 items-center border-b border-slate-200 px-6 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 font-bold text-white">
            SP
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Citizen Portal
            </p>
            <p className="text-xs text-slate-500">Smart City</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (pathname.startsWith(item.href) &&
              item.href !== "/citizen/complaints/new");
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon
                className={`h-5 w-5 flex-shrink-0 ${
                  isActive
                    ? "text-blue-600"
                    : "text-slate-400 group-hover:text-slate-600"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            {getInitials(displayName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">
              {displayName}
            </p>
            <p className="truncate text-xs text-slate-500">Citizen</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        {content}
      </aside>

      {/* Mobile Sidebar */}
      {isOpen && (
        <aside className="fixed inset-y-0 z-50 flex w-72 flex-col lg:hidden">
          {content}
        </aside>
      )}
    </>
  );
}
