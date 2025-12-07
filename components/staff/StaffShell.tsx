"use client";

import type { CurrentUser } from "@/lib/types/auth";
import { StaffSidebar } from "./StaffSidebar";
import { StaffTopBar } from "./StaffTopBar";

interface StaffShellProps {
  user: CurrentUser;
  children: React.ReactNode;
}

export function StaffShell({ user, children }: StaffShellProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Fixed/Static */}
      <StaffSidebar user={user} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:min-w-0">
        <StaffTopBar user={user} />

        <main className="flex-1 overflow-y-auto">
          {/* Responsive Container */}
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
