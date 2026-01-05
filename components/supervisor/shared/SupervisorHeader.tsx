"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Menu, Search, Bell, User, HelpCircle, 
  Settings, LogOut 
} from "lucide-react";
import type { CurrentUser } from "@/lib/types/auth";
import { useSidebar } from "./SidebarContext";
import { GlobalSearch } from "./GlobalSearch";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  user: CurrentUser;
  displayName: string;
  jurisdictionLabel: string;
  badgeCounts: { notifications: number };
}

export function SupervisorHeader({ user, displayName, jurisdictionLabel, badgeCounts }: HeaderProps) {
  const router = useRouter();
  const { toggleMobile } = useSidebar();
  const [showSearchMobile, setShowSearchMobile] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass h-16 transition-all duration-200">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        
        {/* LEFT: Mobile Toggle & Search */}
        <div className="flex items-center gap-4 flex-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden" 
            onClick={toggleMobile}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Desktop Search */}
          <div className="hidden md:block w-full max-w-md">
            <GlobalSearch userId={user.id} />
          </div>

          {/* Mobile Search Toggle */}
          <div className="md:hidden">
             {showSearchMobile ? (
               <div className="absolute inset-0 bg-background z-50 flex items-center px-4 animate-in fade-in slide-in-from-top-2">
                 <GlobalSearch userId={user.id} autoFocus />
                 <Button variant="ghost" size="sm" onClick={() => setShowSearchMobile(false)} className="ml-2">Cancel</Button>
               </div>
             ) : (
               <Button variant="ghost" size="icon" onClick={() => setShowSearchMobile(true)}>
                 <Search className="h-5 w-5 text-muted-foreground" />
               </Button>
             )}
          </div>
        </div>

        {/* RIGHT: Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Jurisdiction Pill */}
          <div className="hidden xl:flex flex-col items-end mr-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Jurisdiction
            </span>
            <Badge variant="outline" className="bg-muted/50 text-foreground border-border font-medium">
              {jurisdictionLabel}
            </Badge>
          </div>

          <div className="h-6 w-px bg-border hidden md:block" />

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
            {badgeCounts.notifications > 0 && (
              <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-destructive rounded-full border-2 border-background" />
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="pl-2 pr-1 h-10 rounded-full hover:bg-muted/50 gap-2">
                <div className="hidden sm:block text-right mr-1">
                  <p className="text-sm font-semibold leading-none">{displayName}</p>
                  <p className="text-[10px] text-muted-foreground leading-none mt-1">Supervisor</p>
                </div>
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src={user.profile?.profile_photo_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                    {displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/supervisor/profile")}>
                <User className="mr-2 h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/supervisor/settings")}>
                <Settings className="mr-2 h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/help")}>
                <HelpCircle className="mr-2 h-4 w-4" /> Help & Support
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}