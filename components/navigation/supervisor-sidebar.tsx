"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPrimaryRole, getRoleDisplayName, getRoleBadgeColor } from "@/lib/utils/role-helpers"
import { useDepartments } from "@/lib/hooks/use-complaints"
import type { UserWithRoles } from "@/lib/types/complaints"
import {
  LayoutDashboard,
  UserPlus,
  Users,
  AlertTriangle,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  BarChart3,
} from "lucide-react"
import { useState } from "react"

interface SupervisorSidebarProps {
  user: UserWithRoles
  departmentId: string | null
  onDepartmentChange: (id: string) => void
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/supervisor-app/dashboard" },
  { id: "unassigned", label: "Unassigned", icon: UserPlus, href: "/supervisor-app/unassigned" },
  { id: "workload", label: "Team Workload", icon: Users, href: "/supervisor-app/workload" },
  { id: "escalations", label: "Escalations", icon: AlertTriangle, href: "/supervisor-app/escalations" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/supervisor-app/analytics" },
  { id: "notifications", label: "Notifications", icon: Bell, href: "/supervisor-app/notifications" },
]

export function SupervisorSidebar({ user, departmentId, onDepartmentChange }: SupervisorSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { departments, loading: deptLoading } = useDepartments()
  const primaryRole = getPrimaryRole(user)

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border h-screen sticky top-0 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-primary-foreground font-bold text-lg shrink-0">
          SC
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-sm text-sidebar-foreground truncate">Smart City</h1>
            <p className="text-xs text-muted-foreground truncate">Supervisor Portal</p>
          </div>
        )}
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
              <span className="text-sm font-medium">{user.full_name?.charAt(0)?.toUpperCase() || "S"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user.full_name || "Supervisor"}</p>
              <Badge variant="secondary" className={cn("text-xs mt-1", primaryRole && getRoleBadgeColor(primaryRole))}>
                {primaryRole ? getRoleDisplayName(primaryRole) : "Supervisor"}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Department Selector */}
      {!collapsed && departments.length > 0 && (
        <div className="p-4 border-b border-sidebar-border">
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Department</label>
          <Select value={departmentId || ""} onValueChange={onDepartmentChange}>
            <SelectTrigger className="w-full">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link key={item.id} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>

        {!collapsed && (
          <>
            <Separator className="my-4" />
            <div className="space-y-1">
              <Link href="/staff-app/dashboard">
                <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
                  <Users className="h-5 w-5" />
                  Staff Portal
                </Button>
              </Link>
              <Link href="/supervisor-app/settings">
                <Button variant="ghost" className="w-full justify-start gap-3">
                  <Settings className="h-5 w-5" />
                  Settings
                </Button>
              </Link>
            </div>
          </>
        )}
      </ScrollArea>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-sidebar-border">
        <Button variant="ghost" size="sm" className="w-full justify-center" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  )
}
