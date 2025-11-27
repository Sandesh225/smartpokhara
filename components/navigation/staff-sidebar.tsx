"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { CurrentUser } from "@/lib/types/auth"
import { LayoutDashboard, FileText, CheckSquare, Calendar, BarChart3, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface StaffSidebarProps {
  user: CurrentUser
}

const navigation = [
  { name: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
  { name: "Complaints", href: "/staff/complaints", icon: FileText },
  { name: "Tasks", href: "/staff/tasks", icon: CheckSquare },
  { name: "Work Log", href: "/staff/worklog", icon: Calendar },
  { name: "Reports", href: "/staff/reports", icon: BarChart3 },
  { name: "Profile", href: "/staff/profile", icon: User },
]

export function StaffSidebar({ user }: StaffSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col border-r border-slate-200 bg-white">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-green-700 font-bold text-white">
              SP
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Staff Portal</p>
              <p className="text-xs text-slate-500">Smart City</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-green-50 text-green-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-semibold text-white">
              {user.profile?.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{user.profile?.full_name || "Staff"}</p>
              <p className="truncate text-xs text-slate-500">Staff Member</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
