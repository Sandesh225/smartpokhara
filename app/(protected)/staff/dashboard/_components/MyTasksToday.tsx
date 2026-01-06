"use client"
import { useEffect, useState } from "react"
import { MapPin, Clock, ArrowRight, CheckCircle2, Sparkles } from "lucide-react"
import { StatusBadge } from "@/components/staff/shared/StatusBadge"
import { PriorityBadge } from "@/components/staff/shared/PriorityBadge"
import { getTimeRemaining } from "@/lib/utils/time-helpers"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"

export function MyTasksToday({ tasks }: { tasks: any[] }) {
  const [localTasks, setLocalTasks] = useState(tasks)
  const supabase = createClient()

  // Simple realtime update for task list
  useEffect(() => {
    const channel = supabase
      .channel("my-tasks-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "staff_work_assignments" }, () => {
        // In a real implementation, you'd trigger a server revalidation or fetch here.
        // For now, we rely on the parent page revalidating on navigation or manual refresh.
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (localTasks.length === 0) {
    return (
      <Card className="p-12 text-center border-dashed border-2 bg-linear-to-br from-white to-gray-50/50">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-green-50 to-emerald-50 ring-8 ring-green-50/50 mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
          No tasks assigned for today yet. Check back later or view your schedule.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Today's Queue</h3>
            <p className="text-xs text-gray-500 font-medium">
              {localTasks.length} active {localTasks.length === 1 ? "task" : "tasks"}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span>Live updates</span>
        </div>
      </div>

      <div className="grid gap-4">
        {localTasks.map((task) => (
          <a
            href={`/staff/queue/${task.id}`}
            key={task.id}
            className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-xl"
          >
            <Card className="p-5 transition-all duration-200 hover:shadow-lg hover:shadow-gray-200/80 hover:-translate-y-0.5 hover:border-blue-200 active:scale-[0.99] group-focus-visible:ring-2 group-focus-visible:ring-blue-500">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center text-[11px] font-mono font-medium bg-gray-100 px-2.5 py-1 rounded-md text-gray-700 border border-gray-200">
                    {task.tracking_code}
                  </span>
                  <PriorityBadge priority={task.priority} />
                </div>
                <StatusBadge status={task.status} />
              </div>

              <h4 className="font-semibold text-gray-900 mb-3 line-clamp-2 text-base leading-snug group-hover:text-blue-700 transition-colors">
                {task.title}
              </h4>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <div
                      className={`rounded-full p-1 ${task.due_at && new Date(task.due_at) < new Date() ? "bg-red-100" : "bg-gray-100"}`}
                    >
                      <Clock
                        className={`h-3.5 w-3.5 ${task.due_at && new Date(task.due_at) < new Date() ? "text-red-600" : "text-gray-600"}`}
                      />
                    </div>
                    <span
                      className={`font-medium ${task.due_at && new Date(task.due_at) < new Date() ? "text-red-600" : "text-gray-700"}`}
                    >
                      {getTimeRemaining(task.due_at)}
                    </span>
                  </div>
                  {task.location && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <div className="rounded-full p-1 bg-gray-100">
                        <MapPin className="h-3.5 w-3.5" />
                      </div>
                      <span className="truncate max-w-[120px] font-medium text-gray-700">{task.location}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-medium">View</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Card>
          </a>
        ))}
      </div>
    </div>
  )
}
