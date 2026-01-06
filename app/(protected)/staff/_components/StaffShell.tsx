"use client";

import { useState } from "react";
import type { CurrentUser } from "@/lib/types/auth";
import { StaffSidebar } from "./StaffSidebar";
import { StaffTopBar } from "./StaffTopBar";
import { StaffBottomNav } from "./StaffBottomNav";

interface StaffShellProps {
  user: CurrentUser;
  children: React.ReactNode;
}

export function StaffShell({ user, children }: StaffShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* 1. Sidebar (Desktop: Fixed, Mobile: Drawer) */}
      <StaffSidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
        {/* Top Bar (Mobile/Tablet Only trigger) */}
        <StaffTopBar user={user} onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="container-padding section-spacing max-w-[1600px] mx-auto pb-24 lg:pb-12">
            {children}
          </div>
        </main>
      </div>

      {/* 3. Mobile Bottom Navigation (Glass) */}
      <div className="lg:hidden">
        <StaffBottomNav user={user} />
      </div>
    </div>
  );
}