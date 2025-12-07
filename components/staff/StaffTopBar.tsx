"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CurrentUser } from "@/lib/types/auth";
import { getUserDisplayName } from "@/lib/auth/role-helpers";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Bell, Menu, User, LogOut } from "lucide-react";

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

  // Helper to get initials
  const initials = getUserDisplayName(user)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-6 shadow-sm sticky top-0 z-30">
      {/* Mobile menu button placeholder - Logic usually controlled by Shell state */}
      <button className="lg:hidden text-gray-500">
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex flex-1 items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 lg:hidden">
            Staff Portal
          </h1>
          <p className="hidden text-sm text-gray-500 lg:block">
            Welcome back, {getUserDisplayName(user)}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications Placeholder */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-gray-500 hover:text-gray-700"
          >
            <Bell className="h-5 w-5" />
            {/* <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" /> */}
          </Button>

          {/* User menu */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3 pl-2 pr-4 rounded-full border border-gray-200 hover:bg-gray-50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {initials}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-medium text-gray-700">
                  {getUserDisplayName(user)}
                </p>
              </div>
            </Button>

            {isUserMenuOpen && (
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-xl animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-gray-100 mb-1">
                  <p className="text-sm font-medium text-gray-900">
                    {getUserDisplayName(user)}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>

                <Link
                  href="/staff/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Profile Settings
                </Link>

                <Link
                  href="/citizen/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" />{" "}
                  {/* Reuse icon type or import separate */}
                  Citizen View
                </Link>

                <div className="my-1 border-t border-gray-100" />

                <button
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
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

// Simple icon component for LayoutDashboard to avoid import error in this specific file if Lucide wasn't fully imported
function LayoutDashboard({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}
