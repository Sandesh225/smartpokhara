// components/navigation/StaffTopBar.tsx
"use client";

import { NotificationBell } from "@/components/staff/notifications/NotificationBell";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";

interface StaffTopBarProps {
  user: any;
}

export function StaffTopBar({ user }: StaffTopBarProps) {
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const displayName = user.profile?.full_name || user.email.split("@")[0];
  const primaryRole = user.roles[0] || "staff";

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex-1">
        {/* Optional: Breadcrumb or page title can go here */}
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <NotificationBell />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium">{displayName}</div>
                <div className="text-xs text-gray-500 capitalize">
                  {primaryRole.replace("_", " ")}
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="p-2">
              <div className="text-sm font-medium">{displayName}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
