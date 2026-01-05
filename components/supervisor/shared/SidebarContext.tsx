"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isMobileOpen: boolean;
  toggleMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Default to expanded on desktop
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Optional: Restore state from localStorage here
    const saved = localStorage.getItem("supervisor-sidebar-collapsed");
    if (saved) setIsCollapsed(JSON.parse(saved));
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("supervisor-sidebar-collapsed", JSON.stringify(newState));
  };

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed: isMounted ? isCollapsed : false, // Prevent hydration mismatch
        toggleCollapse,
        isMobileOpen,
        toggleMobile: () => setIsMobileOpen(!isMobileOpen),
        closeMobile: () => setIsMobileOpen(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within SidebarProvider");
  return context;
};