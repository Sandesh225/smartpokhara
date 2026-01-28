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
  Vote,
  Shield,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
          name: "Participatory Budgeting",
          href: "/citizen/participatory-budgeting",
          icon: Vote,
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
    <div className="flex flex-col h-full bg-card border-r-2 border-border/60 w-72">
      <div className="h-20 flex items-center justify-between px-6 border-b-2 border-border bg-gradient-to-br from-muted/30 to-transparent">
        <Link
          href="/citizen/dashboard"
          className="flex items-center gap-3 group"
          onClick={() => setSidebarOpen(false)}
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg"
          >
            <Shield className="h-6 w-6" strokeWidth={2.5} />
          </motion.div>
          <div>
            <h1 className="text-base font-black tracking-tight leading-none text-foreground">
              Smart Pokhara
            </h1>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1 block flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" />
              Citizen Portal
            </span>
          </div>
        </Link>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-2 text-muted-foreground hover:bg-accent rounded-xl transition-all"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </motion.button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8 custom-scrollbar">
        {navGroups.map((group, groupIndex) => (
          <motion.div
            key={group.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: groupIndex * 0.1 }}
          >
            <h3 className="mb-3 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              {group.label}
              <div className="h-px flex-1 bg-border" />
            </h3>
            <div className="space-y-1">
              {group.items.map((item, itemIndex) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: groupIndex * 0.1 + itemIndex * 0.05,
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-all relative overflow-hidden",
                        active
                          ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {active && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                      <div className="flex items-center gap-3 relative z-10">
                        <div
                          className={cn(
                            "h-8 w-8 rounded-xl flex items-center justify-center transition-all",
                            active
                              ? "bg-primary/10 text-primary"
                              : "bg-muted/50 text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span>{item.name}</span>
                      </div>
                      <AnimatePresence>
                        {item.badge && item.badge > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-brand px-2 text-[10px] font-black text-white shadow-md"
                          >
                            {item.badge > 99 ? "99+" : item.badge}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </nav>

      <div className="p-4 border-t-2 border-border bg-gradient-to-br from-muted/20 to-transparent">
        <div className="flex items-center gap-3 p-3 rounded-2xl border-2 border-border bg-background/50 backdrop-blur-sm shadow-sm">
          <div className="h-11 w-11 rounded-2xl border-2 border-border overflow-hidden flex-shrink-0 shadow-sm">
            {profilePhotoUrl ? (
              <img
                src={profilePhotoUrl}
                alt={user.displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-sm">
                {user.displayName?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-black text-foreground">
              {user.displayName}
            </p>
            <p className="truncate text-[10px] text-muted-foreground uppercase tracking-tight font-bold">
              {user.roleName || "Citizen"}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSignOut}
            className="p-2 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 h-screen z-[70] shadow-2xl"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <aside className="hidden lg:flex fixed top-0 left-0 h-screen z-40">
        <SidebarContent />
      </aside>
    </>
  );
}