// components/staff/StaffTopBar.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CurrentUser } from "@/lib/types/auth";
import { getUserDisplayName, getInitials } from "@/lib/auth/role-helpers";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/NotificationBell";

interface StaffTopBarProps {
  user: CurrentUser;
}

export function StaffTopBar({ user }: StaffTopBarProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-6 shadow-sm">
      {/* Mobile menu button */}
      <button
        onClick={() => {
          // This would toggle the mobile sidebar - we'll need to use a context or state
          // For now, we'll just refresh to show the sidebar is working
          window.location.reload();
        }}
        className="lg:hidden"
      >
        <span className="sr-only">Open sidebar</span>
        <div className="h-6 w-6 text-gray-500">☰</div>
      </button>

      <div className="flex flex-1 items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Staff Portal
          </h1>
          <p className="text-sm text-gray-500">
            Welcome back, {getUserDisplayName(user)}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <NotificationBell userId={user.id} />
          
          {/* User menu */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {getInitials(getUserDisplayName(user))}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {getUserDisplayName(user)}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </Button>

            {isUserMenuOpen && (
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <Link
                  href="/staff/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  Profile Settings
                </Link>
                <Link
                  href="/citizen/dashboard"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  Citizen View
                </Link>
                <div className="my-1 border-t border-gray-100" />
                <button
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {isLoggingOut ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}