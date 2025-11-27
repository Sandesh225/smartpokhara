/**
 * Centralized toast notification system
 * Provides consistent, professional government-style feedback
 */

import toast from "react-hot-toast"

export type ToastType = "success" | "error" | "info" | "loading"

/**
 * Show success toast with professional message
 */
export function showSuccessToast(message: string) {
  toast.success(message, {
    duration: 4000,
    position: "top-right",
    style: {
      background: "#ecfdf5",
      color: "#065f46",
      border: "1px solid #a7f3d0",
      borderRadius: "0.5rem",
    },
    iconTheme: {
      primary: "#10b981",
      secondary: "#ecfdf5",
    },
  })
}

/**
 * Show error toast with professional message
 */
export function showErrorToast(message: string, details?: string) {
  const fullMessage = details ? `${message}: ${details}` : message
  toast.error(fullMessage, {
    duration: 5000,
    position: "top-right",
    style: {
      background: "#fef2f2",
      color: "#7f1d1d",
      border: "1px solid #fecaca",
      borderRadius: "0.5rem",
    },
    iconTheme: {
      primary: "#ef4444",
      secondary: "#fef2f2",
    },
  })
}

/**
 * Show loading toast
 */
export function showLoadingToast(message: string): string {
  return toast.loading(message, {
    position: "top-right",
    style: {
      background: "#f0f9ff",
      color: "#003366",
      border: "1px solid #bfdbfe",
      borderRadius: "0.5rem",
    },
  })
}

/**
 * Dismiss a specific toast by ID
 */
export function dismissToast(toastId: string) {
  toast.dismiss(toastId)
}

/**
 * Update a toast (useful for loading → success/error transitions)
 */
export function updateToast(toastId: string, type: ToastType, message: string) {
  toast.dismiss(toastId)
  if (type === "success") {
    showSuccessToast(message)
  } else if (type === "error") {
    showErrorToast(message)
  }
}

/**
 * Wrapper for async operations with automatic toast management
 */
export async function withToast<T>(
  promise: Promise<T>,
  {
    loading = "Processing...",
    success = "Operation completed successfully",
    error: errorMsg = "Operation failed",
  }: {
    loading?: string
    success?: string
    error?: string
  } = {},
): Promise<T> {
  const toastId = showLoadingToast(loading)
  try {
    const result = await promise
    updateToast(toastId, "success", success)
    return result
  } catch (err: any) {
    const errorMessage = err?.message || errorMsg
    updateToast(toastId, "error", errorMessage)
    throw err
  }
}
