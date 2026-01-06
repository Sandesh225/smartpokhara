"use client";

import { type ReactNode, useEffect, useState } from "react";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import { SupervisorSidebar } from "./SupervisorSidebar";
import { SupervisorHeader } from "./SupervisorHeader";
import type { CurrentUser } from "@/lib/types/auth";
import { cn } from "@/lib/utils";

// Inner component to consume context
function LayoutContent({
  children,
  user,
  displayName,
  jurisdictionLabel,
  badgeCounts,
  onLogout,
  isLoggingOut,
}: any) {
  const { isCollapsed, isMobileOpen, closeMobile } = useSidebar();

  // Prevent layout shift by delaying the transition class until mounted
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Desktop Sidebar - Fixed */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden lg:block bg-card border-r border-border shadow-sm transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[70px]" : "w-72"
        )}
      >
        <SupervisorSidebar
          badgeCounts={badgeCounts}
          onLogout={onLogout}
          isLoggingOut={isLoggingOut}
        />
      </aside>

      {/* Mobile Drawer - Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={closeMobile}
          />

          {/* Drawer */}
          <div className="relative w-[280px] h-full bg-card shadow-2xl animate-in slide-in-from-left duration-300">
            <SupervisorSidebar
              badgeCounts={badgeCounts}
              onLogout={onLogout}
              isLoggingOut={isLoggingOut}
              className="border-none"
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
          mounted ? (isCollapsed ? "lg:pl-[70px]" : "lg:pl-72") : "lg:pl-72"
        )}
      >
        <SupervisorHeader
          user={user}
          displayName={displayName}
          jurisdictionLabel={jurisdictionLabel}
          badgeCounts={badgeCounts}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1920px] mx-auto animate-in fade-in duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}

// Wrapper to provide context
export function SupervisorLayoutShell(props: any) {
  return (
    <SidebarProvider>
      <LayoutContent {...props} />
    </SidebarProvider>
  );
}