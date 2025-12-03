"use client"

import { X, RefreshCw, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NewComplaintsBannerProps {
  onRefresh: () => void
  onDismiss: () => void
  className?: string
}

export function NewComplaintsBanner({ onRefresh, onDismiss, className }: NewComplaintsBannerProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50 p-4 animate-slide-down",
        className,
      )}
    >
      <div className="flex items-center gap-3 text-sm text-blue-800 dark:text-blue-200">
        <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900/50">
          <Bell className="h-4 w-4" />
        </div>
        <div>
          <p className="font-medium">New complaints available</p>
          <p className="text-xs text-blue-600 dark:text-blue-300">New complaints have been added to this queue</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="h-8 text-xs bg-white dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh now
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
