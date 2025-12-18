// components/navigation/Navbar.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CurrentUser } from "@/lib/types/auth";
import {
  getUserDisplayName,
  getPrimaryRole,
  getRoleDisplayName,
  getRoleBadgeColor,
  isAdmin,
  isStaff,
} from "@/lib/auth/role-helpers";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";

interface NavbarProps {
  user: CurrentUser;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const primaryRole = getPrimaryRole(user);

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

  const getNavigationItems = () => {
    const items: { label: string; href: string }[] = [];

    if (isAdmin(user)) {
      items.push(
        { label: "Admin Dashboard", href: "/admin/dashboard" },
        { label: "Users", href: "/admin/users" },
        { label: "Analytics", href: "/admin/analytics" }
      );
    }

    if (isStaff(user) && !isAdmin(user)) {
      items.push(
        { label: "Staff Dashboard", href: "/staff/dashboard" },
        { label: "Complaints", href: "/staff/complaints" }
      );
    }

    items.push(
      { label: "My Dashboard", href: "/citizen/dashboard" },
      { label: "Submit Complaint", href: "/citizen/complaints/new" },
      { label: "My Complaints", href: "/citizen/complaints" }
    );

    return items;
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-blue-700 text-sm font-bold text-white">
              SP
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Smart City Pokhara
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                Citizen Portal
              </p>
            </div>
          </Link>
        </div>

        {/* Desktop nav */}
        <div className="hidden items-center space-x-4 md:flex">
          {navigationItems.slice(0, 3).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* User section */}
        <div className="flex items-center gap-4">
          {primaryRole && (
            <div
              className={`hidden rounded-full px-3 py-1 text-xs font-medium md:block ${getRoleBadgeColor(
                primaryRole
              )}`}
            >
              {getRoleDisplayName(primaryRole)}
            </div>
          )}

          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setIsUserMenuOpen((open) => !open)}
              className="flex items-center gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {getInitials(getUserDisplayName(user))}
              </div>
              <span className="hidden md:block">
                {getUserDisplayName(user)}
              </span>
              <svg
                className={`h-4 w-4 transition-transform ${
                  isUserMenuOpen ? "rotate-180" : ""
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>

            {isUserMenuOpen && (
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border bg-white py-2 shadow-lg">
                <div className="border-b px-4 py-2">
                  <p className="text-sm font-medium text-gray-900">
                    {getUserDisplayName(user)}
                  </p>
                  <p className="truncate text-xs text-gray-500">{user.email}</p>
                </div>

                <Link
                  href="/citizen/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  Profile Settings
                </Link>

                {isAdmin(user) && (
                  <Link
                    href="/admin/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}

                <div className="my-2 border-t" />

                <button
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {isLoggingOut ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}