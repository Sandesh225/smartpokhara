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
    <div className="flex h-screen w-full overflow-hidden bg-background relative">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-muted/10 to-background pointer-events-none" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl -z-10 pointer-events-none animate-pulse" />
      <div
        className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-secondary/3 rounded-full blur-3xl -z-10 pointer-events-none animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <Sidebar
        user={user}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        counts={counts}
      />

      <div className="flex flex-1 flex-col min-w-0 lg:ml-72">
        <Header
          user={user}
          setSidebarOpen={setSidebarOpen}
          notificationCount={counts.notifications}
          onCountUpdate={(newCount) =>
            setCounts((prev) => ({ ...prev, notifications: newCount }))
          }
        />

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}