import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getCurrentUserWithRoles } from "@/lib/auth/session"
import { isStaff } from "@/lib/auth/role-helpers"
import { StaffShell } from "@/components/staff/StaffShell"

export const dynamic = "force-dynamic"

interface StaffLayoutProps {
  children: ReactNode
}

export default async function StaffLayout({ children }: StaffLayoutProps) {
  // 1. Fetch User
  const user = await getCurrentUserWithRoles()

  if (!user) {
    redirect("/login")
  }

  // 2. Role Guard
  // The isStaff helper correctly checks against the list of staff roles
  // (ward_staff, dept_staff, field_staff, etc.) AND checks if the staff profile is active.
  if (!isStaff(user)) {
    // If they are an admin, send them to admin dash
    if (user.roles.includes("admin")) {
      redirect("/admin/dashboard")
    }
    // Otherwise fallback to citizen
    redirect("/citizen/dashboard")
  }

  // 3. Render Shell
  return <StaffShell user={user}>{children}</StaffShell>
}
