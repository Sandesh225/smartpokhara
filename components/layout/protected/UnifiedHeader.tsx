"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Menu, Search, Bell, LogOut, Moon, Sun, User, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useThemeMode } from "flowbite-react";
import { getUserDisplayName } from "@/lib/auth/role-helpers";
import { toast } from "sonner";
import { NotificationDropdown } from "@/components/shared/NotificationDropdown";
import Link from "next/link";

interface Props {
  user: any;
  dashboardType: string;
  setSidebarOpen: (val: boolean) => void;
  notificationCount: number;
}

export function UnifiedHeader({ user, dashboardType, setSidebarOpen, notificationCount }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const { mode, toggleMode } = useThemeMode();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayName = getUserDisplayName(user);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 h-20 w-full border-b-2 border-border/60 bg-card/80 backdrop-blur-2xl shadow-sm">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 border-2 rounded-xl bg-background hover:border-primary">
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search system..." className="h-10 pl-9 pr-4 rounded-xl bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-background outline-none w-64 transition-all text-sm font-medium" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={toggleMode} className="h-10 w-10 flex items-center justify-center rounded-xl border-2 bg-background hover:border-primary text-muted-foreground">
            {mounted ? (mode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : <Sun className="h-4 w-4" />}
          </button>

          <div className="relative">
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative h-10 w-10 flex items-center justify-center rounded-xl border-2 bg-background hover:border-primary text-muted-foreground transition-all"
            >
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-5 min-w-[20px] rounded-full bg-destructive text-[10px] font-black text-white flex items-center justify-center ring-4 ring-card">
                  {notificationCount}
                </span>
              )}
            </button>

            <NotificationDropdown
              userId={user.id}
              portal={dashboardType as any}
              isOpen={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
              onCountUpdate={(count) => {
                // This will update the local count if needed
              }}
            />
          </div>

          <div className="relative">
            <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-1 pr-2 rounded-full border-2 border-transparent hover:bg-muted transition-all">
              <Avatar className="h-8 w-8 border-2 border-primary/20">
                <AvatarImage src={user.profile?.profile_photo_url} />
                <AvatarFallback className="bg-primary text-white font-bold">{displayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left min-w-[100px]">
                <p className="text-xs font-bold truncate text-foreground">{displayName}</p>
                <p className="text-[9px] font-black uppercase text-primary tracking-widest">{dashboardType}</p>
              </div>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border bg-card shadow-2xl p-2 z-50">
                <Link href={`/${dashboardType}/profile`} className="flex items-center gap-3 p-3 text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl">
                  <User className="h-4 w-4" /> My Profile
                </Link>
                <Link href={`/${dashboardType}/settings`} className="flex items-center gap-3 p-3 text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl">
                  <Settings className="h-4 w-4" /> Settings
                </Link>
                <hr className="my-1 border-border" />
                <button onClick={handleSignOut} className="flex w-full items-center gap-3 p-3 text-sm font-bold text-destructive hover:bg-destructive/10 rounded-xl">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
