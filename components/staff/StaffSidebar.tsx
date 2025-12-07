"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CurrentUser } from "@/lib/types/auth";
import { hasRole } from "@/lib/auth/role-helpers";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  MapPin,
  Phone,
  Users,
  BarChart3,
  X,
} from "lucide-react";

interface StaffSidebarProps {
  user: CurrentUser;
}

export function StaffSidebar({ user }: StaffSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
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
    // Complaints list -> team queue
    {
      name: "Complaints",
      href: "/staff/queue/team",
      icon: FileText,
      roles: ["ward_staff", "dept_staff", "dept_head", "call_center"],
    },
    // Tasks list -> my tasks
    {
      name: "My Tasks",
      href: "/staff/queue/my-tasks",
      icon: ClipboardList,
      roles: ["field_staff", "dept_staff", "ward_staff"],
    },
    {
      name: "Field Work",
      href: "/staff/field",
      icon: MapPin,
      roles: ["field_staff"],
    },
    {
      name: "Helpdesk",
      href: "/staff/helpdesk",
      icon: Phone,
      roles: ["call_center"],
    },
    {
      name: "Staff Management",
      href: "/staff/management",
      icon: Users,
      roles: ["dept_head"],
    },
    {
      name: "Analytics",
      href: "/staff/analytics",
      icon: BarChart3,
      roles: ["dept_head", "ward_staff"],
    },
  ].filter((item) => hasRole(user, item.roles));

  const isActive = (href: string) => {
    if (href === "/staff/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const primaryRole =
    user.roles && user.roles.length > 0 ? user.roles[0] : "staff";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 border-r border-gray-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              SP
            </div>
            <div className="ml-3">
              <h1 className="text-sm font-semibold text-gray-900">
                Staff Portal
              </h1>
              <p className="text-xs text-gray-500 capitalize">
                {primaryRole.replace("_", " ")}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 text-gray-500 hover:text-gray-900"
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      active
                        ? "text-blue-600"
                        : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
