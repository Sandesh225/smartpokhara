"use client";

import { useState } from "react";
import { UnifiedSidebar } from "./UnifiedSidebar";
import { UnifiedHeader } from "./UnifiedHeader";
import { ROLE_NAVIGATION } from "@/lib/config/navigation";
import { DashboardType } from "@/lib/types/auth";

interface Props {
  user: any;
  dashboardType: DashboardType;
  counts: Record<string, number>;
  children: React.ReactNode;
}

export function UnifiedShell({ user, dashboardType, counts, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = ROLE_NAVIGATION[dashboardType] || ROLE_NAVIGATION.citizen;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background relative">
      {/* Universal Background Decor */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-secondary/3 rounded-full blur-3xl -z-10 pointer-events-none" />

      <UnifiedSidebar 
        user={user} 
        dashboardType={dashboardType} 
        navItems={navItems} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        counts={counts} 
      />

      <div className="flex flex-1 flex-col min-w-0 lg:ml-72 transition-all duration-300">
        <UnifiedHeader 
          user={user} 
          dashboardType={dashboardType} 
          setSidebarOpen={setSidebarOpen} 
          notificationCount={counts.notifications || 0} 
        />
        
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8">
          <div className="max-w-[1600px] mx-auto pb-20">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
