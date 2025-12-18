"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { CurrentUser } from "@/lib/types/auth"
import { hasRole } from "@/lib/auth/role-helpers"
import { LayoutDashboard, ClipboardList, CalendarDays, MessageSquare, Settings } from "lucide-react"

function active(pathname: string, href: string) {
  if (href === "/staff/dashboard") return pathname === href
  return pathname === href || pathname.startsWith(href + "/")
}

export function StaffBottomNav({ user }: { user: CurrentUser }) {
  const pathname = usePathname()

  const items = [
    {
      name: "Home",
      href: "/staff/dashboard",
      icon: LayoutDashboard,
      roles: ["ward_staff", "dept_staff", "field_staff", "dept_head", "call_center"],
    },
    {
      name: "Queue",
      href: "/staff/queue",
      icon: ClipboardList,
      roles: ["ward_staff", "dept_staff", "field_staff", "dept_head"],
    },
    {
      name: "Schedule",
      href: "/staff/schedule",
      icon: CalendarDays,
      roles: ["ward_staff", "dept_staff", "field_staff", "dept_head", "call_center"],
    },
    {
      name: "Messages",
      href: "/staff/messages",
      icon: MessageSquare,
      roles: ["ward_staff", "dept_staff", "field_staff", "dept_head", "call_center"],
    },
    {
      name: "More",
      href: "/staff/settings",
      icon: Settings,
      roles: ["ward_staff", "dept_staff", "field_staff", "dept_head", "call_center"],
    },
  ].filter((i) => hasRole(user, i.roles))

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200/80 bg-white/80 backdrop-blur-xl shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      <div className="mx-auto grid max-w-md grid-cols-5 px-2 py-2 safe-area-inset-bottom">
        {items.map((item) => {
          const Icon = item.icon
          const isOn = active(pathname, item.href)

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-semibold transition-all duration-200 active:scale-95 relative ${
                isOn ? "text-blue-700" : "text-gray-600 hover:text-gray-900"
              }`}
              aria-current={isOn ? "page" : undefined}
            >
              {isOn && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-8 bg-linear-to-r from-blue-600 to-blue-700 rounded-full" />
              )}
              <div className={`p-1.5 rounded-lg transition-colors ${isOn ? "bg-blue-50" : ""}`}>
                <Icon className={`h-5 w-5 ${isOn ? "text-blue-600" : ""}`} />
              </div>
              <span className="leading-none">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
