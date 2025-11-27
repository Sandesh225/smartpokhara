// components/navigation/top-bar.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import type { CurrentUser } from "@/lib/types/auth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { showErrorToast } from "@/lib/shared/toast-service";

interface TopBarProps {
  user: CurrentUser;
}

export function TopBar({ user }: TopBarProps) {
  const router = useRouter();
  const supabase = createClient();

  const [isMenuOpen] = useState(false); // reserved for future mobile menu
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      showErrorToast("Failed to sign out. Please try again.");
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Branding */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-lg font-semibold text-slate-900"
          >
            Smart City Pokhara
          </Link>
        </div>

        {/* User */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-600">
            {user.profile?.full_name || user.email}
          </div>
          <Button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            variant="outline"
            size="sm"
            className="gap-2 bg-transparent"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
