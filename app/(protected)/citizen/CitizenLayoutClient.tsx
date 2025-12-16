// app/(protected)/citizen/CitizenLayoutClient.tsx
"use client";

import { useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import Sidebar from "@/components/shared/citizen/Sidebar";
import Header from "@/components/shared/citizen/Header";

interface UserData {
  id: string;
  email: string;
  displayName: string;
  roleName: string;
  roles: string[];
  profile: any;
}

interface InitialCounts {
  complaints: number;
  notifications: number;
}

interface CitizenLayoutClientProps {
  user: UserData;
  initialCounts: InitialCounts;
  children: ReactNode;
}

// UX: Institutional Footer
function CitizenFooter() {
  const year = useMemo(() => new Date().getFullYear(), []);
  return (
    <footer className="shrink-0 border-t border-gray-200 bg-white/50 backdrop-blur-sm px-6 py-6 mt-auto">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
        <div className="text-gray-500">
          <p>
            © {year} <strong>Pokhara Metropolitan City</strong>.
          </p>
          <p className="text-xs mt-1">Digital Services Portal v2.0</p>
        </div>

        <div className="flex gap-6 text-gray-600 font-medium">
          <Link href="#" className="hover:text-blue-700 transition-colors">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-blue-700 transition-colors">
            Terms of Service
          </Link>
          <Link href="#" className="hover:text-blue-700 transition-colors">
            Help Center
          </Link>
          <Link href="#" className="hover:text-blue-700 transition-colors">
            Accessibility
          </Link>
        </div>
      </div>
    </footer>
  );
}

// UX: Breadcrumbs for orientation
function Breadcrumbs() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  // Skip if just on dashboard
  if (pathname === "/citizen/dashboard") return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4 hidden sm:block">
      <ol className="flex items-center space-x-2 text-sm text-gray-500">
        <li>
          <Link
            href="/citizen/dashboard"
            className="hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {paths.slice(1).map((path, index) => {
          const isLast = index === paths.length - 2;
          const href = `/citizen/${paths.slice(1, index + 2).join("/")}`;
          const label =
            path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");

          return (
            <li key={path} className="flex items-center">
              <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
              {isLast ? (
                <span
                  className="font-semibold text-gray-800"
                  aria-current="page"
                >
                  {label}
                </span>
              ) : (
                <Link
                  href={href}
                  className="hover:text-blue-600 transition-colors"
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default function CitizenLayoutClient({
  user,
  initialCounts,
  children,
}: CitizenLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [counts, setCounts] = useState(initialCounts);

  return (
    <div className="flex h-screen min-h-screen overflow-hidden bg-gray-50 text-gray-900">
      {/* Accessibility Skip Link */}
      <a
        href="#citizen-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:shadow-xl focus:ring-2 focus:ring-blue-500 focus:text-blue-700"
      >
        Skip to main content
      </a>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        user={user}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        counts={counts}
      />

      {/* Main Layout */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden lg:ml-72 transition-all duration-300">
        <Header
          user={user}
          setSidebarOpen={setSidebarOpen}
          notificationCount={counts.notifications}
          onCountUpdate={(newCount) =>
            setCounts({ ...counts, notifications: newCount })
          }
        />

        <main
          id="citizen-main"
          className="flex-1 overflow-y-auto scroll-smooth p-4 lg:p-8"
        >
          <div className="mx-auto max-w-6xl space-y-4">
            <Breadcrumbs />
            {children}
          </div>
        </main>

        <CitizenFooter />
      </div>
    </div>
  );
}