"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Loader2, WifiOff, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button";
import DashboardStats from "@/components/citizen/dashboard/DashboardStats"
import RecentComplaints from "@/components/citizen/dashboard/RecentComplaints"
import PendingBills from "@/components/citizen/dashboard/PendingBills"
import RecentNotices from "@/components/citizen/dashboard/RecentNotices"
import QuickActions from "@/components/citizen/dashboard/QuickActions"

export default function CitizenDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [isConnected, setIsConnected] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [wardId, setWardId] = useState<number | null>(null)

  const [data, setData] = useState({
    complaints: [],
    bills: [],
    notices: [],
    loading: true,
    totalComplaints: 0,
    pendingBillsCount: 0,
  })

  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  })

  const fetchData = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUserId(user.id)

      const { data: profile } = await supabase.from("user_profiles").select("ward_id").eq("user_id", user.id).single()
      const userWardId = profile?.ward_id
      setWardId(userWardId)

      const { data: allComplaints, error: complaintsError } = await supabase
        .from("complaints")
        .select("*")
        .eq("citizen_id", user.id)
        .order("submitted_at", { ascending: false })

      if (complaintsError) throw complaintsError

      const complaintsList = allComplaints || []

      console.log(
        "📊 Raw Complaints:",
        complaintsList.map((c) => ({
          code: c.tracking_code,
          status: c.status,
        })),
      )

      const total = complaintsList.length

      const open = complaintsList.filter((c) =>
        ["received", "under_review", "assigned", "reopened"].includes(c.status),
      ).length

      const inProgress = complaintsList.filter((c) => c.status === "in_progress").length

      const resolved = complaintsList.filter((c) => ["resolved", "closed"].includes(c.status)).length

      console.log("📈 Stats:", { total, open, inProgress, resolved })

      const { data: bills } = await supabase.from("bills").select("*").eq("citizen_id", user.id).eq("status", "pending")

      let noticeQuery = supabase.from("notices").select("*").order("published_at", { ascending: false }).limit(5)

      if (userWardId) {
        noticeQuery = noticeQuery.or(`is_public.eq.true,ward_id.eq.${userWardId}`)
      } else {
        noticeQuery = noticeQuery.eq("is_public", true)
      }

      const { data: notices } = await noticeQuery

      setData({
        complaints: complaintsList.slice(0, 5),
        bills: bills || [],
        notices: notices || [],
        loading: false,
        totalComplaints: total,
        pendingBillsCount: bills?.length || 0,
      })

      setStats({ total, open, inProgress, resolved })
    } catch (error) {
      console.error("❌ Error:", error)
      setData((prev) => ({ ...prev, loading: false }))
      toast.error("Failed to load dashboard")
    }
  }, [router, supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`citizen-dashboard-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "complaints",
          filter: `citizen_id=eq.${userId}`,
        },
        (payload) => {
          console.log("🔔 Real-time:", payload.eventType, payload.new?.status)
          fetchData()
          router.refresh()

          if (payload.eventType === "UPDATE") {
            const newStatus = payload.new?.status
            const oldStatus = payload.old?.status

            if (newStatus === "in_progress" && oldStatus !== "in_progress") {
              toast.info("Staff started working on your complaint!")
            }
            if (newStatus === "resolved" && oldStatus !== "resolved") {
              toast.success("Your complaint has been resolved!")
            }
          }
        },
      )
      .subscribe((status) => setIsConnected(status === "SUBSCRIBED"))

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase, fetchData, router])

  if (data.loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100"
        role="status"
        aria-live="polite"
        aria-label="Loading dashboard"
      >
        <div className="relative">
          <Loader2 className="h-14 w-14 animate-spin text-primary" aria-hidden="true" />
          <div className="absolute inset-0 h-14 w-14 animate-ping text-primary/20">
            <Loader2 className="h-14 w-14" />
          </div>
        </div>
        <p className="mt-6 text-sm text-gray-600 font-semibold animate-pulse">Loading your dashboard...</p>
        <p className="mt-1 text-xs text-gray-500">Please wait a moment</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8" role="main" aria-label="Citizen dashboard">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-border/50">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight text-balance">
            Citizen Dashboard
          </h1>
          <p className="text-gray-600 text-sm sm:text-base font-medium">
            Overview of your activity and municipal services
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap" role="group" aria-label="Dashboard actions">
          {!isConnected && (
            <div
              className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3.5 py-2 rounded-full text-xs font-bold border-2 border-amber-200 shadow-sm animate-pulse"
              role="status"
              aria-live="polite"
            >
              <WifiOff className="w-3.5 h-3.5 animate-bounce" aria-hidden="true" />
              <span>Reconnecting...</span>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData()}
            className="gap-2 shadow-sm hover:shadow-md hover:border-primary/50 hover:-translate-y-0.5 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Refresh dashboard data"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline font-medium">Refresh</span>
          </Button>
        </div>
      </header>

      {/* Stats Section */}
      <section aria-label="Statistics overview">
        <DashboardStats
          totalComplaints={stats.total}
          openCount={stats.open}
          inProgressCount={stats.inProgress}
          resolvedCount={stats.resolved}
        />
      </section>

      {/* Quick Actions Section */}
      <section aria-label="Quick actions">
        <QuickActions
          complaintsCount={data.totalComplaints}
          pendingBillsCount={data.pendingBillsCount}
          noticesCount={data.notices.length}
        />
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column - Complaints and Bills */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <RecentComplaints complaints={data.complaints} />
          <PendingBills bills={data.bills} />
        </div>

        {/* Right Column - Notices and Emergency */}
        <aside className="space-y-6 sm:space-y-8" aria-label="Notices and emergency contacts">
          <RecentNotices notices={data.notices} wardNumber={wardId} />

          <div
            className="bg-gradient-to-br from-red-50 via-rose-50 to-red-50 border-2 border-red-200 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200"
            role="region"
            aria-label="Emergency contacts"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-red-100 rounded-xl shadow-sm">
                <AlertCircle className="w-6 h-6 text-red-600" aria-hidden="true" />
              </div>
              <h3 className="font-black text-lg text-red-800">Emergency Contacts</h3>
            </div>
            <div className="space-y-3 text-sm" role="list">
              {/* Police */}
              <div
                className="flex justify-between items-center p-3.5 bg-white rounded-xl hover:bg-red-50 hover:shadow-sm transition-all duration-150 border border-red-100"
                role="listitem"
              >
                <span className="font-semibold text-red-700">Police</span>
                <a
                  href="tel:100"
                  className="font-black text-lg text-red-600 hover:text-red-700 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 rounded-lg px-3 py-1.5 transition-all duration-150"
                  aria-label="Call police emergency number 100"
                >
                  100
                </a>
              </div>
              {/* Ambulance */}
              <div
                className="flex justify-between items-center p-3.5 bg-white rounded-xl hover:bg-red-50 hover:shadow-sm transition-all duration-150 border border-red-100"
                role="listitem"
              >
                <span className="font-semibold text-red-700">Ambulance</span>
                <a
                  href="tel:102"
                  className="font-black text-lg text-red-600 hover:text-red-700 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 rounded-lg px-3 py-1.5 transition-all duration-150"
                  aria-label="Call ambulance emergency number 102"
                >
                  102
                </a>
              </div>
              {/* Fire */}
              <div
                className="flex justify-between items-center p-3.5 bg-white rounded-xl hover:bg-red-50 hover:shadow-sm transition-all duration-150 border border-red-100"
                role="listitem"
              >
                <span className="font-semibold text-red-700">Fire</span>
                <a
                  href="tel:101"
                  className="font-black text-lg text-red-600 hover:text-red-700 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 rounded-lg px-3 py-1.5 transition-all duration-150"
                  aria-label="Call fire emergency number 101"
                >
                  101
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
