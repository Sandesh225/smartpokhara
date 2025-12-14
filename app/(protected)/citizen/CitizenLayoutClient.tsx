// app/(protected)/citizen/CitizenLayoutClient.tsx
"use client";

import { useMemo, useState, type ReactNode } from "react";
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

function CitizenFooter() {
  const year = useMemo(() => new Date().getFullYear(), []);
  return (
    <footer className="shrink-0 border-t border-gray-200/70 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="px-4 py-4 lg:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">
              © {year} Smart Pokhara • Citizen Portal
            </p>
            <p className="text-xs text-gray-500">
              Built for a faster, more transparent municipal experience.
            </p>
          </div>
        </div>
      </div>
    </footer>
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
    <div className="flex h-screen min-h-screen overflow-hidden bg-gradient-to-b from-gray-50 to-white text-gray-900">
      {/* Skip link for keyboard users */}
      <a
        href="#citizen-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg focus:ring-2 focus:ring-blue-500/30"
      >
        Skip to content
      </a>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed Left */}
      <Sidebar
        user={user}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        counts={counts}
      />

      {/* Main Content Area - Scrollable */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden lg:ml-72 transition-all duration-300">
        <Header
          user={user}
          setSidebarOpen={setSidebarOpen}
          notificationCount={counts.notifications}
          onCountUpdate={(newCount) =>
            setCounts({ ...counts, notifications: newCount })
          }
        />

        {/* Scrollable Page Content */}
        <main
          id="citizen-main"
          className="flex-1 overflow-y-auto scroll-smooth px-4 py-4 lg:px-6 lg:py-6"
        >
          <div className="mx-auto max-w-7xl space-y-6">{children}</div>
        </main>

        {/* Footer */}
        <CitizenFooter />
      </div>
    </div>
  );
}
