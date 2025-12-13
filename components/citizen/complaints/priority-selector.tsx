"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import type { ComplaintPriority } from "@/lib/supabase/queries/complaints"
import { AlertTriangle, AlertCircle, Clock, Info } from "lucide-react"

interface PrioritySelectorProps {
  value: ComplaintPriority
  onChange: (value: ComplaintPriority) => void
}

const priorities: {
  value: ComplaintPriority
  label: string
  description: string
  icon: React.ElementType
  color: string
}[] = [
  {
    value: "low",
    label: "Low",
    description: "Non-urgent, can wait",
    icon: Info,
    color: "text-muted-foreground bg-muted border-muted",
  },
  {
    value: "medium",
    label: "Medium",
    description: "Standard priority",
    icon: Clock,
    color: "text-chart-3 bg-chart-3/10 border-chart-3/30",
  },
  {
    value: "high",
    label: "High",
    description: "Needs quick attention",
    icon: AlertCircle,
    color: "text-chart-4 bg-chart-4/10 border-chart-4/30",
  },
  {
    value: "urgent",
    label: "Urgent",
    description: "Immediate action needed",
    icon: AlertTriangle,
    color: "text-destructive bg-destructive/10 border-destructive/30",
  },
]

export function PrioritySelector({ value, onChange }: PrioritySelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Select priority level">
      {priorities.map((priority) => {
        const isSelected = value === priority.value
        const Icon = priority.icon

        return (
          <button
            key={priority.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(priority.value)}
            className={cn(
              "flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200",
              "hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isSelected ? priority.color : "border-border bg-card hover:border-border/80",
            )}
          >
            <Icon className={cn("h-5 w-5 mb-1.5", isSelected ? "" : "text-muted-foreground")} />
            <span className={cn("text-sm font-medium", isSelected ? "" : "text-foreground")}>{priority.label}</span>
          </button>
        )
      })}
    </div>
  )
}
