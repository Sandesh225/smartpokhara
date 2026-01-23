"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  FileText,
  CreditCard,
  Bell,
  User,
  Settings,
  LogOut,
  X,
  Briefcase,
  MapPin,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SidebarProps {
  user: any;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  counts: { complaints: number; notifications: number };
}

export default function Sidebar({
  user,
  sidebarOpen,
  setSidebarOpen,
  counts,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    toast.promise(
      async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
      },
      {
        loading: "Signing out...",
        success: "Signed out successfully",
        error: "Failed to sign out",
      }
    );
  };

  const isActive = (href: string) =>
    href === "/citizen/dashboard"
      ? pathname === href
      : pathname.startsWith(href);

  const profilePhotoUrl =
    user?.profile?.profile_photo_url || user?.avatar_url || null;

  const navGroups = [
    {
      label: "Overview",
      items: [
        { name: "Dashboard", href: "/citizen/dashboard", icon: Home },
        {
          name: "Ward Notices",
          href: "/citizen/notices",
          icon: Bell,
          badge: counts.notifications,
        },
      ],
    },
    {
      label: "Services",
      items: [
        {
          name: "My Complaints",
          href: "/citizen/complaints",
          icon: FileText,
          badge: counts.complaints,
        },
        {
          name: "Bills & Payments",
          href: "/citizen/payments",
          icon: CreditCard,
        },
        { name: "Request Service", href: "/citizen/services", icon: Briefcase },
      ],
    },
    {
      label: "Account",
      items: [
        { name: "My Profile", href: "/citizen/profile", icon: User },
        { name: "Settings", href: "/citizen/settings", icon: Settings },
      ],
    },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-background border-r border-border/60 ">
      {/* HEADER */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-border">
        <Link
          href="/citizen/dashboard"
          className="flex items-center gap-3 group"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground group-hover:scale-110 transition-transform duration-300">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight leading-none">
              Smart Pokhara
            </h1>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1 block">
              Citizen Portal
            </span>
          </div>
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-2 text-muted-foreground hover:bg-accent rounded-lg"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-8 custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.label}>
            <h3 className="mb-3 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
              {group.label}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "group flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          active ? "text-primary" : "text-muted-foreground/70"
                        )}
                      />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && item.badge > 0 && (
                      <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* USER SECTION */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-2 rounded-lg border border-border bg-muted/30">
          <div className="h-9 w-9 rounded-full border border-border overflow-hidden flex-shrink-0">
            {profilePhotoUrl ? (
              <img
                src={profilePhotoUrl}
                alt={user.displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                {user.displayName?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-bold text-foreground">
              {user.displayName}
            </p>
            <p className="truncate text-[10px] text-muted-foreground uppercase tracking-tight">
              {user.roleName || "Citizen"}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* MOBILE DRAWER */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] h-full shadow-2xl">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex fixed top-0 left-0  h-screen border-r border-border z-40 bg-background">
        <SidebarContent />
      </aside>
    </>
  );
}
