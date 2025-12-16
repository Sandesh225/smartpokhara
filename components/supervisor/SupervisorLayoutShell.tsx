"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CurrentUser } from "@/lib/types/auth";
import { SupervisorHeader } from "@/components/supervisor/SupervisorHeader";
import {
  SupervisorSidebar,
  SUPERVISOR_MENU_ITEMS,
} from "@/components/supervisor/SupervisorSidebar";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SupervisorLayoutShellProps {
  user: CurrentUser;
  children: ReactNode;
}

export function SupervisorLayoutShell({
  user,
  children,
}: SupervisorLayoutShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <SupervisorSidebar />

      {/* Main Wrapper */}
      <div className="flex min-h-screen flex-col md:pl-64">
        {/* Header with mobile toggle wired */}
        <SupervisorHeader
          user={user}
          toggleSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Page Content */}
        <main
          className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8"
          aria-label="Supervisor main content"
        >
          <div className="mx-auto max-w-6xl space-y-6">{children}</div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" aria-modal="true" role="dialog">
          {/* Panel */}
          <div className="flex h-full w-64 flex-col border-r bg-white shadow-xl">
            {/* Mobile Header */}
            <div className="flex h-14 items-center justify-between border-b px-4">
              <div className="flex items-center gap-2 text-base font-semibold text-blue-900">
                <span aria-hidden="true">🏙️</span>
                <span className="truncate">Smart Pokhara</span>
              </div>
              <button
                type="button"
                onClick={closeMobileSidebar}
                aria-label="Close navigation"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-3" aria-label="Mobile navigation">
              <div className="space-y-1 px-3">
                {SUPERVISOR_MENU_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileSidebar}
                      className={cn(
                        "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-blue-50 text-blue-700 shadow-sm"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            "h-5 w-5",
                            isActive
                              ? "text-blue-600"
                              : "text-gray-400 group-hover:text-gray-500"
                          )}
                          aria-hidden="true"
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="inline-flex items-center justify-center rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold leading-none text-red-800">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Divider + Settings Link (reuse URL) */}
              <div className="mt-4 border-t border-gray-200 pt-3">
                <Link
                  href="/supervisor/settings"
                  onClick={closeMobileSidebar}
                  className="mx-3 flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <span>Settings</span>
                </Link>
              </div>
            </nav>

            {/* Logout */}
            <div className="border-t border-gray-200 p-4">
              <form action="/login" method="post" className="w-full">
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  <span>Logout</span>
                </button>
              </form>
            </div>
          </div>

          {/* Backdrop */}
          <button
            type="button"
            className="flex-1 bg-black/40"
            aria-label="Close navigation overlay"
            onClick={closeMobileSidebar}
          />
        </div>
      )}
    </div>
  );
}
