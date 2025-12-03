"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CardSkeleton } from "@/components/shared/loading-skeleton"
import { cn } from "@/lib/utils"
import { FileText, Clock, AlertTriangle, CheckCircle, TrendingUp, Users, type LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: number | string
  description?: string
  icon: LucideIcon
  trend?: number
  loading?: boolean
  className?: string
  iconClassName?: string
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  loading,
  className,
  iconClassName,
}: StatCardProps) {
  if (loading) {
    return <CardSkeleton />
  }

  return (
    <Card className={cn("card-hover", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("rounded-full p-2 bg-primary/10", iconClassName)}>
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold animate-count-up">{value}</div>
        {(description || trend !== undefined) && (
          <div className="flex items-center gap-2 mt-1">
            {trend !== undefined && (
              <span
                className={cn("flex items-center text-xs font-medium", trend >= 0 ? "text-green-600" : "text-red-600")}
              >
                <TrendingUp className={cn("h-3 w-3 mr-0.5", trend < 0 && "rotate-180")} />
                {Math.abs(trend)}%
              </span>
            )}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface StaffStatsCardsProps {
  openComplaints: number
  overdueComplaints: number
  resolvedThisWeek: number
  pendingAcceptance: number
  loading?: boolean
}

export function StaffStatsCards({
  openComplaints,
  overdueComplaints,
  resolvedThisWeek,
  pendingAcceptance,
  loading,
}: StaffStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Open Complaints"
        value={openComplaints}
        description="Assigned to you"
        icon={FileText}
        loading={loading}
      />
      <StatCard
        title="Overdue"
        value={overdueComplaints}
        description="Past SLA deadline"
        icon={AlertTriangle}
        loading={loading}
        iconClassName="bg-red-100 dark:bg-red-900/30"
      />
      <StatCard
        title="Resolved This Week"
        value={resolvedThisWeek}
        description="Great progress!"
        icon={CheckCircle}
        loading={loading}
        iconClassName="bg-green-100 dark:bg-green-900/30"
      />
      <StatCard
        title="Pending Acceptance"
        value={pendingAcceptance}
        description="Awaiting your action"
        icon={Clock}
        loading={loading}
        iconClassName="bg-yellow-100 dark:bg-yellow-900/30"
      />
    </div>
  )
}

interface SupervisorStatsCardsProps {
  totalOpen: number
  unassigned: number
  overdue: number
  escalated: number
  loading?: boolean
}

export function SupervisorStatsCards({
  totalOpen,
  unassigned,
  overdue,
  escalated,
  loading,
}: SupervisorStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Open" value={totalOpen} description="In department" icon={FileText} loading={loading} />
      <StatCard
        title="Unassigned"
        value={unassigned}
        description="Needs assignment"
        icon={Users}
        loading={loading}
        iconClassName="bg-blue-100 dark:bg-blue-900/30"
      />
      <StatCard
        title="Overdue"
        value={overdue}
        description="SLA breached"
        icon={AlertTriangle}
        loading={loading}
        iconClassName="bg-red-100 dark:bg-red-900/30"
      />
      <StatCard
        title="Escalated"
        value={escalated}
        description="Needs attention"
        icon={TrendingUp}
        loading={loading}
        iconClassName="bg-purple-100 dark:bg-purple-900/30"
      />
    </div>
  )
}
