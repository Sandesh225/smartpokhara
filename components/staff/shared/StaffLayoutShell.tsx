"use client";

import type { ReactNode } from "react";
import { StaffHeader } from "@/components/staff/shared/StaffHeader";
import { StaffSidebar } from "@/components/staff/shared/StaffSidebar";
import { StaffBottomNav } from "@/components/staff/shared/StaffBottomNav";

interface StaffLayoutShellProps {
  user: any;
  badgeCounts: {
    queue: number;
    notifications: number;
    messages: number;
  };
  onLogout: () => Promise<void>;
  isLoggingOut: boolean;
  children: ReactNode;
}

export function StaffLayoutShell({
  user,
  badgeCounts,
  onLogout,
  isLoggingOut,
  children,
}: StaffLayoutShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* --- DESKTOP SIDEBAR (Hidden on Mobile) --- */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white lg:shadow-sm z-50">
        <StaffSidebar
          user={user}
          badgeCounts={badgeCounts}
          onLogout={onLogout}
          isLoggingOut={isLoggingOut}
        />
      </div>

      {/* --- MAIN WRAPPER --- */}
      <div className="flex-1 flex flex-col lg:pl-72 transition-all duration-300 pb-20 lg:pb-0">
        
        {/* Header */}
        <StaffHeader 
          user={user} 
          notificationsCount={badgeCounts.notifications}
        />

        {/* Page Content */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* --- MOBILE BOTTOM NAV (Hidden on Desktop) --- */}
      <StaffBottomNav badgeCounts={badgeCounts} />
    </div>
  );
}