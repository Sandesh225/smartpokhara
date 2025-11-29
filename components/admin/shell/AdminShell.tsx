"use client";

import { useState } from "react";
import type { CurrentUser } from "@/lib/types/auth";
import { AdminSidebar } from "./Sidebar";
import { AdminTopbar } from "./Topbar";
import { Breadcrumbs } from "./Breadcrumbs";

interface AdminShellProps {
  user: CurrentUser;
  children: React.ReactNode;
}

export function AdminShell({ user, children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <AdminSidebar
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="admin-main">
        {/* Topbar */}
        <AdminTopbar user={user} onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="admin-content">
          <Breadcrumbs />
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
