/**
 * Primary action button with loading state
 * Government-quality design with clear feedback
 */

import type { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  isLoading?: boolean
  loadingText?: string
  variant?: "primary" | "danger" | "secondary"
}

export function PrimaryButton({
  children,
  isLoading = false,
  loadingText = "Processing...",
  variant = "primary",
  className,
  disabled,
  ...props
}: PrimaryButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center px-4 py-2.5 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-gray-400",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-gray-400",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 disabled:bg-gray-100",
  }

  return (
    <button disabled={isLoading || disabled} className={cn(baseStyles, variants[variant], className)} {...props}>
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  )
}
