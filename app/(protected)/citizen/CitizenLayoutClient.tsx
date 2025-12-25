"use client";

import { useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import Header from "@/components/shared/citizen/Header";
import Sidebar from "@/components/shared/citizen/Sidebar";

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

function CitizenFooter() {
  const year = useMemo(() => new Date().getFullYear(), []);
  return (
    <footer className="shrink-0 border-t border-[rgb(229,231,235)] glass px-6 py-6 mt-auto">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
        <div className="text-[rgb(107,114,128)]">
          <p className="font-medium">
            © {year}{" "}
            <strong className="font-bold text-[rgb(26,32,44)]">
              Pokhara Metropolitan City
            </strong>
            .
          </p>
          <p className="text-xs mt-1 font-medium">
            Digital Services Portal v2.0
          </p>
        </div>

        <div className="flex gap-6 text-[rgb(107,114,128)] font-medium text-sm">
          <Link
            href="#"
            className="hover:text-[rgb(43,95,117)] transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            className="hover:text-[rgb(43,95,117)] transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            href="#"
            className="hover:text-[rgb(43,95,117)] transition-colors"
          >
            Help Center
          </Link>
          <Link
            href="#"
            className="hover:text-[rgb(43,95,117)] transition-colors"
          >
            Accessibility
          </Link>
        </div>
      </div>
    </footer>
  );
}

function Breadcrumbs() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  if (pathname === "/citizen/dashboard") return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6 hidden sm:block">
      <ol className="flex items-center space-x-2 text-sm text-[rgb(107,114,128)]">
        <li>
          <Link
            href="/citizen/dashboard"
            className="hover:text-[rgb(43,95,117)] flex items-center gap-1 transition-colors font-medium"
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
              <ChevronRight className="h-4 w-4 text-[rgb(209,213,219)] mx-1" />
              {isLast ? (
                <span
                  className="font-semibold text-[rgb(26,32,44)]"
                  aria-current="page"
                >
                  {label}
                </span>
              ) : (
                <Link
                  href={href}
                  className="hover:text-[rgb(43,95,117)] transition-colors font-medium"
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
    <div className="flex h-screen min-h-screen overflow-hidden bg-[rgb(244,245,247)] text-[rgb(26,32,44)]">
      {/* Accessibility Skip Link */}
      <a
        href="#citizen-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:shadow-xl focus:ring-2 focus:ring-[rgb(43,95,117)] focus:text-[rgb(43,95,117)] focus:border focus:border-[rgb(229,231,235)]"
      >
        Skip to main content
      </a>

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
          className="flex-1 overflow-y-auto scroll-smooth section-spacing container-padding"
        >
          <div className="mx-auto max-w-7xl space-y-6">
            <Breadcrumbs />
            {children}
          </div>
        </main>

        <CitizenFooter />
      </div>
    </div>
  );
}
