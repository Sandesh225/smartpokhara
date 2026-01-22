"use client";

import { useState, type ReactNode } from "react";
import Header from "./layout/Header";
import Sidebar from "./layout/Sidebar";

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
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-background to-muted/30 pointer-events-none" />
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* SIDEBAR */}
      <Sidebar
        user={user}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        counts={counts}
      />

      {/* MAIN CONTENT */}
      <div className="flex flex-1 flex-col min-w-0 lg:ml-80 transition-all duration-300">
        <Header
          user={user}
          setSidebarOpen={setSidebarOpen}
          notificationCount={counts.notifications}
          onCountUpdate={(newCount) =>
            setCounts((prev) => ({ ...prev, notifications: newCount }))
          }
        />
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-[1600px] mx-auto p-6">{children}</div>
        </main>
      </div>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-md lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
