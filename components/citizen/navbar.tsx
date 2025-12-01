"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Home,
  FileText,
  PlusCircle,
  Search,
  MapPin,
  CreditCard,
  User,
  LogOut,
  Bell,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { showSuccessToast, showErrorToast } from "@/lib/shared/toast-service";

interface CitizenNavbarProps {
  userName?: string;
  userEmail?: string;
  unreadNotifications?: number;
}

export function CitizenNavbar({
  userName,
  userEmail,
  unreadNotifications = 0,
}: CitizenNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to sign out");
      }

      showSuccessToast("Logged out successfully", "See you soon!");
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      showErrorToast(
        "Failed to log out",
        "Please try again or contact support."
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navLinks = [
    {
      href: "/citizen",
      label: "Dashboard",
      icon: Home,
    },
    {
      href: "/citizen/complaints",
      label: "My Complaints",
      icon: FileText,
    },
    {
      href: "/citizen/complaints/new",
      label: "Submit Complaint",
      icon: PlusCircle,
      highlight: true,
    },
    {
      href: "/citizen/track",
      label: "Track",
      icon: Search,
    },
    {
      href: "/citizen/ward",
      label: "Ward Info",
      icon: MapPin,
    },
    {
      href: "/citizen/payments",
      label: "Payments",
      icon: CreditCard,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/citizen") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/citizen"
            className="flex items-center gap-3 group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Citizen Portal
              </h1>
              <p className="text-xs text-gray-500 -mt-0.5">
                Municipal Services
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${
                      active
                        ? "bg-blue-50 text-blue-700"
                        : link.highlight
                        ? "text-purple-600 hover:bg-purple-50"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-700" />
              {unreadNotifications > 0 && (
                <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </button>

            {/* User Menu - Desktop */}
            <div className="hidden lg:block relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {(userName || userEmail || "U")[0].toUpperCase()}
                </div>
                <div className="text-left hidden xl:block">
                  <p className="text-sm font-medium text-gray-900">
                    {userName || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-[150px]">
                    {userEmail}
                  </p>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-gray-500 transition-transform ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">
                        {userName || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {userEmail}
                      </p>
                    </div>

                    <Link
                      href="/citizen/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <LogOut className="h-4 w-4" />
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-1">
            {/* User Info Mobile */}
            <div className="flex items-center gap-3 px-3 py-3 mb-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {(userName || userEmail || "U")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {userName || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              </div>
            </div>

            {/* Navigation Links */}
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                    ${
                      active
                        ? "bg-blue-50 text-blue-700"
                        : link.highlight
                        ? "text-purple-600 hover:bg-purple-50"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}

            {/* Profile & Logout Mobile */}
            <div className="pt-4 mt-4 border-t border-gray-200 space-y-1">
              <Link
                href="/citizen/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <User className="h-5 w-5" />
                My Profile
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <LogOut className="h-5 w-5" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}