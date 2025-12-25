// lib/design-system/container.tsx
import type React from "react"
import { cn } from "@/lib/utils"

/**
 * SMART CITY POKHARA - GLOBAL CONTAINER SYSTEM
 * Machhapuchhre Modern Design Language
 *
 * Prevents "messy margins" by standardizing spacing & max-widths
 */

interface ContainerProps {
  children: React.ReactNode
  className?: string
  size?: "narrow" | "default" | "wide" | "full"
  spacing?: "none" | "tight" | "normal" | "relaxed"
}

/**
 * Primary Container - Use for all page content
 */
export function Container({ children, className, size = "default", spacing = "normal" }: ContainerProps) {
  const sizeClasses = {
    narrow: "max-w-3xl", // Reading pages, articles
    default: "max-w-5xl", // Standard pages
    wide: "max-w-7xl", // Dashboards, tables
    full: "max-w-full px-0", // Maps, media
  }

  const spacingClasses = {
    none: "py-0",
    tight: "py-4 lg:py-6",
    normal: "py-8 lg:py-12",
    relaxed: "py-12 lg:py-16",
  }

  return (
    <div
      className={cn(
        "mx-auto w-full",
        size !== "full" && "container-padding", // Use global padding utility
        sizeClasses[size],
        spacingClasses[spacing],
        className,
      )}
    >
      {children}
    </div>
  )
}

/**
 * Section - Use for content sections within containers
 */
interface SectionProps {
  children: React.ReactNode
  className?: string
  spacing?: "tight" | "normal" | "relaxed"
}

export function Section({ children, className, spacing = "normal" }: SectionProps) {
  const spacingClasses = {
    tight: "space-y-4",
    normal: "space-y-6 lg:space-y-8",
    relaxed: "space-y-8 lg:space-y-12",
  }

  return <section className={cn(spacingClasses[spacing], className)}>{children}</section>
}

/**
 * PageHeader - Consistent header styling across pages
 */
interface PageHeaderProps {
  title: string
  subtitle?: string
  badge?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, badge, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6", className)}>
      <div className="space-y-3">
        {badge && <div className="flex items-center gap-2">{badge}</div>}
        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black text-foreground tracking-tighter leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground font-medium text-base lg:text-lg leading-relaxed max-w-2xl">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex gap-3 w-full lg:w-auto">{actions}</div>}
    </header>
  )
}

/**
 * Grid - Responsive grid layouts with consistent gaps
 */
interface GridProps {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4
  className?: string
}

export function Grid({ children, cols = 3, className }: GridProps) {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
  }

  return <div className={cn("grid gap-4 lg:gap-6", colClasses[cols], className)}>{children}</div>
}
