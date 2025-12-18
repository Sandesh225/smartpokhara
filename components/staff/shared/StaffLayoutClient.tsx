"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { StaffLayoutShell } from "@/components/staff/shared/StaffLayoutShell";
import { toast } from "sonner";

interface StaffLayoutClientProps {
  user: any; // Staff Profile object
  badgeCounts: {
    queue: number;
    notifications: number;
    messages: number;
  };
  children: ReactNode;
}

export function StaffLayoutClient({
  user,
  badgeCounts,
  children,
}: StaffLayoutClientProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/signout", { method: "POST" });
      if (!response.ok) throw new Error("Logout failed");
      
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to sign out");
      setIsLoggingOut(false);
    }
  };

  return (
    <StaffLayoutShell
      user={user}
      badgeCounts={badgeCounts}
      onLogout={handleLogout}
      isLoggingOut={isLoggingOut}
    >
      {children}
    </StaffLayoutShell>
  );
}