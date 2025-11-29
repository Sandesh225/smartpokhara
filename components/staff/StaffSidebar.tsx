// components/staff/StaffSidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CurrentUser } from "@/lib/types/auth";
import { 
  getRoleDisplayName, 
  hasRole,
  isWardStaff,
  isDeptStaff, 
  isFieldStaff,
  isSupervisor,
  isHelpdesk
} from "@/lib/auth/role-helpers";
import { 
  HomeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  MapIcon,
  PhoneIcon,
  ClipboardDocumentListIcon
} from "@heroicons/react/24/outline";

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
      icon: HomeIcon,
      roles: ["ward_staff", "dept_staff", "field_staff", "dept_head", "call_center"],
    },
    {
      name: "Complaints",
      href: "/staff/complaints",
      icon: DocumentTextIcon,
      roles: ["ward_staff", "dept_staff", "dept_head", "call_center"],
    },
    {
      name: "Tasks",
      href: "/staff/tasks",
      icon: ClipboardDocumentListIcon,
      roles: ["field_staff", "dept_staff", "ward_staff"],
    },
    {
      name: "Field Work",
      href: "/staff/field",
      icon: MapIcon,
      roles: ["field_staff"],
    },
    {
      name: "Helpdesk",
      href: "/staff/helpdesk",
      icon: PhoneIcon,
      roles: ["call_center"],
    },
    {
      name: "Staff Management",
      href: "/staff/management",
      icon: UserGroupIcon,
      roles: ["dept_head"],
    },
    {
      name: "Analytics",
      href: "/staff/analytics",
      icon: ChartBarIcon,
      roles: ["dept_head", "ward_staff"],
    },
  ].filter(item => hasRole(user, item.roles as any));

  const isActive = (href: string) => {
    if (href === "/staff/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              SP
            </div>
            <div className="ml-3">
              <h1 className="text-sm font-semibold text-gray-900">Staff Portal</h1>
              <p className="text-xs text-gray-500">{getRoleDisplayName(getRoleDisplayName(user.roles[0]))}</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden"
          >
            <span className="sr-only">Close sidebar</span>
            <div className="h-6 w-6 text-gray-400">×</div>
          </button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors
                    ${active 
                      ? "bg-blue-50 text-blue-700 border border-blue-200" 
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <Icon className={`
                    mr-3 h-5 w-5 flex-shrink-0
                    ${active ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"}
                  `} />
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