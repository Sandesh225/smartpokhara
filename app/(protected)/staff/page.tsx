"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/lib/hooks/use-complaints"
import { getPrimaryRole, isStaff } from "@/lib/auth/role-helpers"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function StaffAppHomePage() {
  const router = useRouter()
  const { user, loading, error } = useCurrentUser()

  useEffect(() => {
    if (loading) return

    // If not authenticated or not staff, redirect appropriately
    if (!user) {
      router.replace("/login")
      return
    }

    if (!isStaff(user)) {
      router.replace("/citizen/dashboard")
      return
    }

    const primaryRole = getPrimaryRole(user)

    // Route based on primary role
    switch (primaryRole) {
      case "ward_staff":
        // Ward staff land on Ward Queue by default
        router.replace("/staff-app/queue/ward")
        break
      case "dept_staff":
        // Department staff land on Team Queue by default
        router.replace("/staff-app/queue/team")
        break
      case "field_staff":
        // Field staff (technicians) land on My Tasks by default
        router.replace("/staff-app/queue/my-tasks")
        break
      case "dept_head":
        // Department heads can choose - default to supervisor portal
        router.replace("/supervisor-app/dashboard")
        break
      case "call_center":
        // Helpdesk staff land on My Tasks
        router.replace("/staff-app/queue/my-tasks")
        break
      case "admin":
        // Admin gets sent to supervisor portal
        router.replace("/supervisor-app/dashboard")
        break
      default:
        // Fallback to dashboard
        router.replace("/staff-app/dashboard")
    }
  }, [user, loading, router])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading your staff workspace...</p>
        </div>
      </div>
    )
  }

  // Error or not staff state
  if (error || !user || !isStaff(user)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have access to the Staff Portal. Please contact your administrator if you believe this is
              an error.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")} className="w-full">
              Go back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Redirect in progress - show loading
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Redirecting to your workspace...</p>
      </div>
    </div>
  )
}
