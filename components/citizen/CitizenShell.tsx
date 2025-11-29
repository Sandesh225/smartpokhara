"use client";

import { useState, type ReactNode } from "react";
import type { CurrentUser } from "@/lib/types/auth";
import { CitizenNavbar } from "./CitizenNavbar";
import { CitizenSidebar } from "./CitizenSidebar";

interface CitizenShellProps {
  user: CurrentUser;
  children: ReactNode;
}

export function CitizenShell({ user, children }: CitizenShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <CitizenSidebar user={user} isOpen={false} onClose={() => {}} />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden">
            <CitizenSidebar
              user={user}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-72">
        {/* Top Navbar */}
        <CitizenNavbar user={user} onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
