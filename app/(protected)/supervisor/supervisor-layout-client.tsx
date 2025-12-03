"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SupervisorSidebar } from "@/components/navigation/supervisor-sidebar"
import { SupervisorTopBar } from "@/components/navigation/supervisor-topbar"
import { Toaster } from "@/components/ui/toaster"
import { useCurrentUser, useDepartments } from "@/lib/hooks/use-complaints"
import { isSupervisor } from "@/lib/utils/role-helpers"
import { DashboardSkeleton } from "@/components/shared/loading-skeleton"

export default function SupervisorLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, loading: userLoading } = useCurrentUser()
  const { departments } = useDepartments()
  const [departmentId, setDepartmentId] = useState<string | null>(null)

  // Set default department when available
  useEffect(() => {
    if (departments.length > 0 && !departmentId) {
      // Use user's department if available, otherwise first department
      const userDept = user?.department_id || departments[0].id
      setDepartmentId(userDept)
    }
  }, [departments, departmentId, user])

  // Redirect if not authorized
  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login")
    } else if (!userLoading && user && !isSupervisor(user)) {
      router.push("/staff-app/dashboard")
    }
  }, [user, userLoading, router])

  if (userLoading || !user) {
    return <DashboardSkeleton />
  }

  if (!isSupervisor(user)) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SupervisorSidebar user={user} departmentId={departmentId} onDepartmentChange={setDepartmentId} />
      <div className="flex-1 flex flex-col min-w-0">
        <SupervisorTopBar user={user} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
      <Toaster />
    </div>
  )
}
