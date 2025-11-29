// components/layout/navbar.tsx - FIXED VERSION
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { getPrimaryRole, getRoleDisplayName, getUserDisplayName } from "@/lib/auth/role-helpers";
import type { CurrentUser } from "@/lib/types/auth";

interface NavbarProps {
  user: CurrentUser;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  // ✅ FIX: Safe user display name
  const displayName = getUserDisplayName(user);
  const primaryRole = getPrimaryRole(user);
  const roleDisplayName = primaryRole ? getRoleDisplayName(primaryRole) : 'User';

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-slate-900">
              SmartPokhara
            </Link>

            {/* Navigation links */}
            <div className="hidden md:flex gap-6">
              <Link
                href="/citizen/dashboard"
                className={`text-sm font-medium transition-colors hover:text-slate-900 ${
                  pathname === "/citizen/dashboard"
                    ? "text-slate-900"
                    : "text-slate-600"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/citizen/complaints"
                className={`text-sm font-medium transition-colors hover:text-slate-900 ${
                  pathname.startsWith("/citizen/complaints")
                    ? "text-slate-900"
                    : "text-slate-600"
                }`}
              >
                My Complaints
              </Link>
              <Link
                href="/citizen/ward"
                className={`text-sm font-medium transition-colors hover:text-slate-900 ${
                  pathname === "/citizen/ward"
                    ? "text-slate-900"
                    : "text-slate-600"
                }`}
              >
                Ward Info
              </Link>
            </div>
          </div>

          {/* User menu */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-slate-900">
                {displayName}
              </span>
              <span className="text-xs text-slate-500">
                {roleDisplayName}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-slate-700"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}