/**
 * Reusable card container for clean, organized layout
 * Provides consistent spacing, shadows, and borders
 */

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface CardSectionProps {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
  headerAction?: ReactNode
}

export function CardSection({ title, subtitle, children, className, headerAction }: CardSectionProps) {
  return (
    <div className={cn("bg-white rounded-lg shadow-sm border border-gray-200", className)}>
      {(title || headerAction) && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          {headerAction}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
    </div>
  )
}
