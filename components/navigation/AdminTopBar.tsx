// components/navigation/AdminTopBar.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, User as UserIcon, Menu } from "lucide-react";
import type { CurrentUser } from "@/lib/types/auth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { showErrorToast } from "@/lib/shared/toast-service";

interface AdminTopBarProps {
  user: CurrentUser;
}

export function AdminTopBar({ user }: AdminTopBarProps) {
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
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left: logo / title */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="rounded-md p-2 text-slate-400 hover:text-slate-600 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-slate-900">
              Smart City Pokhara
            </h1>
            <p className="text-xs text-slate-500">Admin Portal</p>
          </div>
        </div>

        {/* Right: user menu */}
        <div className="flex items-center gap-4">
          <div className="hidden text-right md:block">
            <p className="text-sm font-medium text-slate-900">
              {user.profile?.full_name || "Administrator"}
            </p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>

          <div className="relative">
            <Button
              onClick={() => setIsUserMenuOpen((open) => !open)}
              variant="ghost"
              size="sm"
              className="h-9 w-9 rounded-full p-0"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-xs font-semibold text-white">
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
                <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-slate-200 bg-white py-2 shadow-lg">
                  <div className="border-b border-slate-200 px-4 py-2">
                    <p className="text-sm font-medium text-slate-900">
                      {user.profile?.full_name || "Administrator"}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user.email}
                    </p>
                  </div>

                  <Link
                    href="/citizen/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <UserIcon className="h-4 w-4" />
                    Profile Settings
                  </Link>

                  <div className="my-1 border-t border-slate-200" />

                  <button
                    onClick={handleSignOut}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4" />
                    {isLoggingOut ? "Signing out..." : "Sign Out"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
