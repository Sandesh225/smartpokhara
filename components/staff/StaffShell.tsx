// components/staff/StaffShell.tsx
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
      {/* Sidebar */}
      <StaffSidebar user={user} />
      
      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <StaffTopBar user={user} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}