"use client";

import { useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import Header from "./layout/Header";
import Sidebar from "./layout/Sidebar";

// Interfaces
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
    <footer className="shrink-0 border-t border-border bg-card/40 dark:bg-card/60 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-6 mt-auto transition-all duration-300">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 text-sm">
          {/* Brand & Version Info */}
          <div className="text-muted-foreground space-y-2 text-center lg:text-left">
            <p className="font-semibold text-base">
              © {year}{" "}
              <strong className="font-bold text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Pokhara Metropolitan City
              </strong>
            </p>
            <p className="text-sm font-medium opacity-90 flex items-center justify-center lg:justify-start gap-2">
              Digital Services Portal{" "}
              <span className="inline-flex items-center rounded-full bg-primary/15 dark:bg-primary/25 px-3 py-1 text-xs font-bold text-primary border border-primary/20">
                v2.0
              </span>
            </p>
          </div>

          {/* Footer Links */}
          <nav className="flex flex-wrap gap-4 lg:gap-6 text-muted-foreground font-medium text-sm justify-center">
            {[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
              { label: "Help Center", href: "/help" },
              { label: "Accessibility", href: "/accessibility" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="hover:text-primary transition-colors duration-200 relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>
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
      <ol className="flex items-center flex-wrap gap-2 text-sm text-muted-foreground">
        {/* Home Link */}
        <li>
          <Link
            href="/citizen/dashboard"
            className="hover:text-primary flex items-center gap-2 transition-all duration-200 font-medium group px-3 py-2 rounded-lg hover:bg-accent"
            aria-label="Dashboard"
          >
            <Home className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </li>

        {/* Dynamic Path Segments */}
        {paths.slice(1).map((path, index) => {
          const isLast = index === paths.length - 2;
          const href = `/citizen/${paths.slice(1, index + 2).join("/")}`;
          const label = path
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          return (
            <li key={path} className="flex items-center">
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 mx-1" />
              {isLast ? (
                <span
                  className="font-bold text-foreground px-3 py-2 bg-primary/10 dark:bg-primary/20 rounded-lg"
                  aria-current="page"
                >
                  {label}
                </span>
              ) : (
                <Link
                  href={href}
                  className="hover:text-primary transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-accent"
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
    <div className="flex h-screen min-h-screen overflow-hidden bg-background text-foreground">
      {/* Enhanced Gradient Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-background to-muted/30 dark:from-[rgb(15,20,25)] dark:via-[rgb(15,20,25)] dark:to-[rgb(26,31,46)]/40 pointer-events-none" />

      {/* Decorative Elements */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 dark:bg-secondary/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Accessibility Skip Link */}
      <a
        href="#citizen-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[100] focus:rounded-xl focus:bg-card focus:px-6 focus:py-4 focus:text-base focus:font-bold focus:shadow-2xl focus:ring-4 focus:ring-primary focus:text-primary focus:border-2 focus:border-primary transition-all duration-200"
      >
        Skip to main content
      </a>

      {/* Sidebar */}
      <Sidebar
        user={user}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        counts={counts}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden lg:ml-80 transition-all duration-300">
        {/* Header */}
        <Header
          user={user}
          setSidebarOpen={setSidebarOpen}
          notificationCount={counts.notifications}
          onCountUpdate={(newCount) =>
            setCounts({ ...counts, notifications: newCount })
          }
        />

        {/* Main Content */}
        <main
          id="citizen-main"
          className="flex-1 overflow-y-auto scroll-smooth px-4 sm:px-6 lg:px-8 py-1 custom-scrollbar"
        >
          <div className="mx-auto max-w-7xl pb-6">
            <Breadcrumbs />

            {/* Content Wrapper with Animation */}
            <div className="relative">{children}</div>
          </div>
        </main>

        {/* Footer */}
        <CitizenFooter />
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 dark:bg-background/90 backdrop-blur-md lg:hidden transition-all duration-300 animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}