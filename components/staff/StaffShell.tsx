"use client";

import type React from "react";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
      <div className="flex min-h-screen">
        {/* Desktop/Mobile Sidebar */}
        <StaffSidebar
          user={user}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Area */}
        <div className="flex flex-1 flex-col lg:min-w-0">
          <StaffTopBar user={user} onMenuClick={() => setSidebarOpen(true)} />

          <main className="flex-1 overflow-y-auto pb-24 lg:pb-8">
            <div className="container mx-auto max-w-[1600px] px-4 py-8 lg:px-8 lg:py-10">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <div className="lg:hidden">
        <StaffBottomNav user={user} />
      </div>
    </div>
  );
}
