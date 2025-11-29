"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, LogOut, User as UserIcon } from "lucide-react";
import type { CurrentUser } from "@/lib/types/auth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  showLoadingToast,
  dismissToast,
  showErrorToast,
} from "@/lib/shared/toast-service";

interface CitizenNavbarProps {
  user: CurrentUser;
  onMenuClick: () => void;
}

const navLinks = [
  { href: "/citizen/dashboard", label: "Dashboard" },
  { href: "/citizen/complaints/new", label: "New Complaint" },
  { href: "/citizen/complaints", label: "My Complaints" },
  { href: "/citizen/track", label: "Track" },
  { href: "/citizen/ward", label: "Ward Info" },
  { href: "/citizen/payments", label: "Payments" },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function CitizenNavbar({ user, onMenuClick }: CitizenNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const displayName = user.profile?.full_name || user.email.split("@")[0];

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const toastId = showLoadingToast("Signing out...");

    try {
      await supabase.auth.signOut();
      dismissToast(toastId);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
      dismissToast(toastId);
      showErrorToast("Failed to sign out", "Please try again");
      setIsSigningOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Menu + Branding */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/citizen/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-sm">
              SP
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-slate-900">
                Smart City Pokhara
              </h1>
              <p className="text-xs text-slate-500">Citizen Service Portal</p>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Nav Links */}
        <nav className="hidden items-center gap-1 rounded-full bg-slate-100 p-1 lg:flex">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: User Menu */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 md:flex">
            Citizen
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 rounded-full"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {getInitials(displayName)}
              </div>
              <span className="hidden text-sm font-medium text-slate-900 md:block">
                {displayName}
              </span>
              <svg
                className={`h-4 w-4 text-slate-600 transition-transform ${
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
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-slate-200 bg-white py-2 shadow-lg">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">
                      {displayName}
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

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4" />
                    {isSigningOut ? "Signing out..." : "Sign Out"}
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
