"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, UserIcon, Menu, Bell, Search, Settings } from "lucide-react";
import type { CurrentUser } from "@/lib/types/auth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { showErrorToast } from "@/lib/shared/toast-service";

interface AdminTopbarProps {
  user: CurrentUser;
  onMenuClick: () => void;
}

export function AdminTopbar({ user, onMenuClick }: AdminTopbarProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
      showErrorToast("Failed to sign out. Please try again.");
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="admin-topbar">
      <div className="flex flex-1 items-center gap-4">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Search */}
        <div className="relative hidden flex-1 max-w-md md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search complaints, users, tasks..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Settings quick access */}
        <Link
          href="/admin/settings"
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <Settings className="h-5 w-5" />
        </Link>

        {/* User info + menu */}
        <div className="hidden items-center gap-3 text-right md:flex">
          <div>
            <p className="text-sm font-medium text-slate-900">
              {user.profile?.full_name || "Administrator"}
            </p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>

        <div className="relative">
          <Button
            onClick={() => setIsUserMenuOpen((open) => !open)}
            variant="ghost"
            size="sm"
            className="h-10 w-10 rounded-full p-0"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-700 text-sm font-semibold text-white">
              {user.profile?.full_name?.charAt(0)?.toUpperCase() ||
                user.email?.charAt(0)?.toUpperCase()}
            </div>
          </Button>

          {isUserMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsUserMenuOpen(false)}
              />
              <div className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-slate-200 bg-white py-2 shadow-lg">
                <div className="border-b border-slate-200 px-4 py-3">
                  <p className="text-sm font-medium text-slate-900">
                    {user.profile?.full_name || "Administrator"}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {user.email}
                  </p>
                </div>
                <Link
                  href="/citizen/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <UserIcon className="h-4 w-4" />
                  Profile Settings
                </Link>
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  System Settings
                </Link>
                <div className="my-1 border-t border-slate-200" />
                <button
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  {isLoggingOut ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
