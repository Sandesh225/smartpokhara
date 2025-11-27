/**
 * Refactored navbar
 * Cleaner layout, better mobile responsiveness, removed duplication
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { CurrentUser } from "@/lib/types/auth"
import { getUserDisplayName, getPrimaryRole, getRoleDisplayName, isAdmin, isStaff } from "@/lib/auth/role-helpers"
import { createClient } from "@/lib/supabase/client"
import { showErrorToast, showSuccessToast } from "@/lib/shared/toast-service"

interface NavbarProps {
  user: CurrentUser
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const supabase = createClient()
  const primaryRole = getPrimaryRole(user)

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    try {
      await supabase.auth.signOut()
      showSuccessToast("Signed out successfully")
      router.push("/login")
      router.refresh()
    } catch (error) {
      showErrorToast("Failed to sign out")
      setIsLoggingOut(false)
    }
  }

  const getDashboardLink = () => {
    if (isAdmin(user)) return "/admin/dashboard"
    if (isStaff(user)) return "/staff/dashboard"
    return "/citizen/dashboard"
  }

  const userInitial = getUserDisplayName(user).charAt(0).toUpperCase()

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={getDashboardLink()} className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              SP
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-gray-900">Smart City Pokhara</h1>
              <p className="text-xs text-gray-500">Citizen Portal</p>
            </div>
          </Link>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* Role Badge */}
            {primaryRole && (
              <div className="hidden md:block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                {getRoleDisplayName(primaryRole)}
              </div>
            )}

            {/* Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {userInitial}
                </div>
                <span className="hidden md:inline text-sm font-medium text-gray-900">{getUserDisplayName(user)}</span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={handleSignOut}
                    disabled={isLoggingOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    {isLoggingOut ? "Signing out..." : "Sign Out"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
