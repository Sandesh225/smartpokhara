"use client";

import { useState, type ReactNode } from "react";
import type { CurrentUser } from "@/lib/types/auth";
import { SupervisorHeader } from "@/components/supervisor/shared/SupervisorHeader";
import { SupervisorSidebar } from "@/components/supervisor/shared/SupervisorSidebar";
import { X } from "lucide-react";

interface SupervisorLayoutShellProps {
  user: CurrentUser;
  displayName: string;
  jurisdictionLabel: string;
  badgeCounts: {
    unassigned: number;
    overdue: number;
    notifications: number;
    messages: number;
  };
  onLogout: () => Promise<void>;
  isLoggingOut: boolean;
  children: ReactNode;
}

export function SupervisorLayoutShell({
  user,
  displayName,
  jurisdictionLabel,
  badgeCounts,
  onLogout,
  isLoggingOut,
  children,
}: SupervisorLayoutShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar (fixed on left) */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white lg:shadow-sm z-50">
        <SupervisorSidebar
          badgeCounts={badgeCounts}
          onLogout={onLogout}
          isLoggingOut={isLoggingOut}
        />
      </div>

      {/* Main content wrapper (shifted for desktop sidebar) */}
      <div className="flex min-h-screen flex-col lg:pl-72 transition-all duration-300">
        {/* Sticky header */}
        <SupervisorHeader
          user={user}
          displayName={displayName}
          jurisdictionLabel={jurisdictionLabel}
          badgeCounts={badgeCounts}
          toggleSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Page Content */}
        <main
          className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full"
          aria-label="Supervisor main content"
        >
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="relative z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Supervisor navigation"
        >
          {/* Backdrop */}
          <button
            type="button"
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={closeMobileSidebar}
            aria-label="Close sidebar"
          />

          {/* Sidebar Panel */}
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white shadow-2xl transform transition-transform duration-300 ease-out">
            <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  SP
                </div>
                <span className="text-lg font-bold text-gray-900">
                  Smart Pokhara
                </span>
              </div>
              <button
                type="button"
                className="rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                onClick={closeMobileSidebar}
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <SupervisorSidebar
                badgeCounts={badgeCounts}
                onLogout={onLogout}
                isLoggingOut={isLoggingOut}
                onNavigate={closeMobileSidebar}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
