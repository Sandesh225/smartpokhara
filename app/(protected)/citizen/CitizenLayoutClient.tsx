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
    <footer className="shrink-0 border-t border-border bg-card/50 backdrop-blur-sm px-6 py-6 mt-auto transition-colors-smooth">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
        {/* Brand & Version Info */}
        <div className="text-muted-foreground space-y-1">
          <p className="font-medium">
            © {year}{" "}
            <strong className="font-bold text-foreground dark:text-glow">
              Pokhara Metropolitan City
            </strong>
          </p>
          <p className="text-xs font-medium opacity-80">
            Digital Services Portal{" "}
            <span className="inline-flex items-center rounded-full bg-primary/10 dark:bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary dark:text-primary">
              v2.0
            </span>
          </p>
        </div>

        {/* Footer Links */}
        <nav className="flex gap-6 text-muted-foreground font-medium text-sm">
          {[
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
            { label: "Help Center", href: "/help" },
            { label: "Accessibility", href: "/accessibility" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="hover:text-primary dark:hover:text-primary transition-colors duration-200 relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary dark:bg-primary transition-all duration-200 group-hover:w-full" />
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

function Breadcrumbs() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  if (pathname === "/citizen/dashboard") return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 hidden sm:block"
    >
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        {/* Home Link */}
        <li>
          <Link
            href="/citizen/dashboard"
            className="hover:text-primary dark:hover:text-primary flex items-center gap-1.5 transition-colors duration-200 font-medium group"
          >
            <Home className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {/* Dynamic Path Segments */}
        {paths.slice(1).map((path, index) => {
          const isLast = index === paths.length - 2;
          const href = `/citizen/${paths.slice(1, index + 2).join("/")}`;
          const label = path
            .charAt(0)
            .toUpperCase() + path.slice(1).replace(/-/g, " ");

          return (
            <li key={path} className="flex items-center">
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 dark:text-muted-foreground/30 mx-1" />
              {isLast ? (
                <span
                  className="font-semibold text-foreground dark:text-foreground"
                  aria-current="page"
                >
                  {label}
                </span>
              ) : (
                <Link
                  href={href}
                  className="hover:text-primary dark:hover:text-primary transition-colors duration-200 font-medium"
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
    <div className="flex h-screen min-h-screen overflow-hidden bg-background text-foreground transition-colors-smooth">
      {/* Gradient Background - Dark Mode Enhancement */}
      <div className="fixed inset-0 -z-10 dark:gradient-dark-mesh pointer-events-none" />

      {/* Accessibility Skip Link */}
      <a
        href="#citizen-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-card focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:shadow-xl focus:ring-2 focus:ring-primary focus:text-primary focus:border focus:border-border dark:focus:accent-glow transition-all duration-200"
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
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden lg:ml-72 transition-all duration-300">
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
          className="flex-1 overflow-y-auto scroll-smooth section-spacing container-padding custom-scrollbar"
        >
          <div className="mx-auto max-w-7xl space-y-6 pb-6">
            <Breadcrumbs />
            
            {/* Content Wrapper with subtle elevation */}
            <div className="relative">
              {children}
            </div>
          </div>
        </main>

        {/* Footer */}
        <CitizenFooter />
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}