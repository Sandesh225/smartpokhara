"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { CurrentUser } from "@/lib/types/auth"
import { LayoutDashboard, PlusCircle, FileText, Search, Bell, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface CitizenSidebarProps {
  user: CurrentUser
}

const navigation = [
  { name: "Dashboard", href: "/citizen/dashboard", icon: LayoutDashboard },
  { name: "New Complaint", href: "/citizen/complaints/new", icon: PlusCircle },
  { name: "My Complaints", href: "/citizen/complaints", icon: FileText },
  { name: "Track Status", href: "/citizen/track", icon: Search },
  { name: "Notifications", href: "/citizen/notifications", icon: Bell },
  { name: "Profile", href: "/citizen/profile", icon: User },
]

export function CitizenSidebar({ user }: CitizenSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col border-r border-slate-200 bg-white">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 font-bold text-white">
              SP
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Citizen Portal</p>
              <p className="text-xs text-slate-500">Smart City</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/citizen/complaints/new")
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
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
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {user.profile?.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{user.profile?.full_name || "Citizen"}</p>
              <p className="truncate text-xs text-slate-500">Citizen</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
