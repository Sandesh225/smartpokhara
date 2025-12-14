"use client";

import { useState, type ReactNode } from "react";
import Sidebar from "@/components/shared/citizen/Sidebar";
import Header from "@/components/shared/citizen/Header";

interface UserData {
  id: string;
  email: string;
  displayName: string;
  roleName: string;
  roles: string[];
  profile: any;
}

interface InitialCounts {
  complaints: number;
  notifications: number;
}

interface CitizenLayoutClientProps {
  user: UserData;
  initialCounts: InitialCounts;
  children: ReactNode;
}

export default function CitizenLayoutClient({
  user,
  initialCounts,
  children,
}: CitizenLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [counts, setCounts] = useState(initialCounts);

  return (
    // H-SCREEN and OVERFLOW-HIDDEN are critical here to prevent double scrollbars
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <Sidebar
        user={user}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        counts={counts}
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        
        {/* Header Component */}
        <Header
          user={user}
          setSidebarOpen={setSidebarOpen}
          notificationCount={counts.notifications}
          onCountUpdate={(newCount) =>
            setCounts({ ...counts, notifications: newCount })
          }
        />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}