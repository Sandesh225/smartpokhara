/**
 * Reusable, accessible form field component
 * Provides consistent styling, error states, and labels
 */

import type { InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  type?: string
}

export function FormField({ label, error, helperText, required, type = "text", className, ...props }: FormFieldProps) {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-900">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        className={cn(
          "w-full px-3 py-2 border rounded-lg",
          "text-sm font-medium text-gray-900",
          "bg-white border-gray-300",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed",
          "transition-colors duration-200",
          error && "border-red-500 focus:ring-red-500",
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      {helperText && !error && <p className="text-xs text-gray-600">{helperText}</p>}
    </div>
  )
}
