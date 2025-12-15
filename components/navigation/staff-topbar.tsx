"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"/ui/
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown/ui/nu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/ui/breadcru/ui/
import { NotificationBell } from "@/components/shared/notification-bell"
import { createClient } from "@/lib/supabase/client"
import {
  getPrimaryRole,
  getRoleDisplayName,
  getUserContextInfo,
  isSupervisor as checkIsSupervisor,
} from "@/lib/auth/role-helpers"
import type { UserWithRoles } from "@/lib/types/complaints"
import { LogOut, User, Settings, Moon, Sun, ChevronDown, ExternalLink, Building2, MapPin } from "lucide-react"
import { useTheme } from "next-themes"

interface StaffTopBarProps {
  user: UserWithRoles
}

const breadcrumbMap: Record<string, string> = {
  "staff-app": "Staff Portal",
  dashboard: "Dashboard",
  queue: "Queue",
  "my-tasks": "My Tasks",
  team: "Team Queue",
  ward: "Ward Queue",
  complaints: "Complaints",
  notifications: "Notifications",
  settings: "Settings",
  profile: "Profile",
}

export function StaffTopBar({ user }: StaffTopBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const supabase = createClient()
  const primaryRole = getPrimaryRole(user)
  const contextInfo = getUserContextInfo(user)
  const isSupervisor = checkIsSupervisor(user)

  const pathSegments = pathname.split("/").filter(Boolean)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      {/* Left side: Breadcrumb + Context */}
      <div className="flex items-center gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            {pathSegments.map((segment, index) => {
              const href = "/" + pathSegments.slice(0, index + 1).join("/")
              const isLast = index === pathSegments.length - 1
              const label = breadcrumbMap[segment] || segment

              return (
                <BreadcrumbItem key={href}>
                  {!isLast ? (
                    <>
                      <BreadcrumbLink asChild>
                        <Link href={href} className="text-muted-foreground hover:text-foreground">
                          {label}
                        </Link>
                      </BreadcrumbLink>
                      <BreadcrumbSeparator />
                    </>
                  ) : (
                    <BreadcrumbPage>{label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Context badge */}
        {contextInfo.name && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs text-muted-foreground">
            {contextInfo.type === "ward" ? <MapPin className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
            <span>{contextInfo.name}</span>
          </div>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Supervisor Portal Quick Link */}
        {isSupervisor && (
          <Button variant="ghost" size="sm" asChild className="hidden sm:flex gap-2">
            <Link href="/supervisor-app/dashboard">
              <ExternalLink className="h-4 w-4" />
              <span className="hidden lg:inline">Supervisor</span>
            </Link>
          </Button>
        )}

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications */}
        <NotificationBell />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2 pr-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profile_photo_url || undefined} />
                <AvatarFallback className="text-xs">{user.full_name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline-block text-sm font-medium">
                {user.full_name?.split(" ")[0] || "User"}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user.full_name}</span>
                <span className="text-xs text-muted-foreground font-normal">
                  {primaryRole ? getRoleDisplayName(primaryRole) : "Staff"}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/staff-app/profile">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/staff-app/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            {isSupervisor && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/supervisor-app/dashboard">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Supervisor Portal
                  </Link>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
