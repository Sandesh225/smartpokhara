"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { CurrentUser } from "@/lib/types/auth";
import { SupervisorLayoutShell } from "@/components/supervisor/shared/SupervisorLayoutShell";
import { toast } from "sonner";

interface SupervisorLayoutClientProps {
  user: CurrentUser;
  displayName: string;
  jurisdictionLabel: string;
  badgeCounts: {
    unassigned: number;
    overdue: number;
    notifications: number;
    messages: number;
  };
  children: ReactNode;
}

export function SupervisorLayoutClient({
  user,
  displayName,
  jurisdictionLabel,
  badgeCounts,
  children,
}: SupervisorLayoutClientProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      // Server Action or API Route for robust cookie clearing
      const response = await fetch("/api/auth/signout", { method: "POST" });
      if (!response.ok) throw new Error("Logout failed");
      
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to sign out. Please try again.");
      setIsLoggingOut(false);
    }
  };

  return (
    <SupervisorLayoutShell
      user={user}
      displayName={displayName}
      jurisdictionLabel={jurisdictionLabel}
      badgeCounts={badgeCounts}
      onLogout={handleLogout}
      isLoggingOut={isLoggingOut}
    >
      {children}
    </SupervisorLayoutShell>
  );
}