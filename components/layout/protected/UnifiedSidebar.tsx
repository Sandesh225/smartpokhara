"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, Shield, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavItem } from "@/lib/config/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  user: any;
  dashboardType: string;
  navItems: NavItem[];
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  counts: Record<string, number>;
}

export function UnifiedSidebar({ user, dashboardType, navItems, isOpen, setIsOpen, counts }: Props) {
  const pathname = usePathname();
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  const toggleDropdown = (name: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card border-r-2 border-border/60 w-72 shadow-2xl lg:shadow-none">
      <div className="h-20 flex items-center justify-between px-6 border-b-2 border-border bg-linear-to-br from-muted/30 to-transparent">
        <Link href={`/${dashboardType}/dashboard`} className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-secondary text-white shadow-lg">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight leading-none text-foreground">Smart Pokhara</h1>
            <span className="text-xs font-bold text-primary uppercase tracking-widest mt-1 flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" /> {dashboardType} Portal
            </span>
          </div>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="lg:hidden">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const hasChildren = !!item.children;
          const isDropdownOpen = openDropdowns[item.name];
          const badgeCount = item.badgeKey ? counts[item.badgeKey] : 0;

          const buttonClass = cn(
            "w-full flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-all relative overflow-hidden group",
            isActive ? "bg-linear-to-r from-primary/10 to-primary/5 text-primary shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          );

          if (hasChildren) {
            return (
              <div key={item.name} className="space-y-1">
                <button onClick={() => toggleDropdown(item.name)} className={buttonClass}>
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", isDropdownOpen && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pl-12 pr-4 space-y-1 overflow-hidden">
                      {item.children!.map((child) => (
                        <Link key={child.href} href={child.href} onClick={() => setIsOpen(false)} className={cn("block py-2 text-sm font-medium transition-colors", pathname === child.href ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
                          {child.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          return (
            <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)} className={buttonClass}>
              {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />}
              <div className="flex items-center gap-3 relative z-10">
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </div>
              {badgeCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-black text-white shadow-md">
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="lg:hidden fixed inset-0 z-60 bg-black/60 backdrop-blur-sm" />
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} transition={{ type: "spring", bounce: 0, duration: 0.4 }} className="lg:hidden fixed left-0 top-0 h-screen z-70">
            <SidebarContent />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Fixed */}
      <aside className="hidden lg:block fixed top-0 left-0 h-screen z-40">
        <SidebarContent />
      </aside>
    </>
  );
}
