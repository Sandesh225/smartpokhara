"use client"

import { type LucideIcon, Inbox, Search, FileX, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>}
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  )
}

export function NoResultsState({ onReset }: { onReset?: () => void }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description="Try adjusting your search or filter criteria"
      action={onReset ? { label: "Clear filters", onClick: onReset } : undefined}
    />
  )
}

interface NoTasksStateProps {
  title?: string
  description?: string
  compact?: boolean
}

export function NoTasksState({
  title = "No tasks assigned",
  description = "You're all caught up! Enjoy a tea while you wait for new assignments.",
  compact = false,
}: NoTasksStateProps) {
  if (compact) {
    return (
      <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
        <FileX className="h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    )
  }

  return <EmptyState icon={FileX} title={title} description={description} />
}

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Something went wrong"
      description={message || "An error occurred while loading data"}
      action={onRetry ? { label: "Try again", onClick: onRetry } : undefined}
    />
  )
}
