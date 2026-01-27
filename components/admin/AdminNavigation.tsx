"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Users,
  Briefcase,
  Settings,
  Vote, // NEW ICON
  CreditCard,
  Megaphone,
  Menu,
  ChevronDown,
  User,
  Moon,
  Sun,
  X,
  LogOut,
} from "lucide-react";

interface NavItemConfig {
  name: string;
  href: string;
  icon: React.ElementType;
  children?: { name: string; href: string; icon: React.ElementType }[];
}

// UPDATED NAV ITEMS
const navItems: NavItemConfig[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Complaints", href: "/admin/complaints", icon: FileText },
  { name: "Tasks", href: "/admin/tasks", icon: CheckSquare },
  {
    name: "Participatory Budget",
    href: "/admin/participatory-budgeting",
    icon: Vote,
  }, // NEW LINK
  { name: "Staff", href: "/admin/staff", icon: Briefcase },
  { name: "Citizens", href: "/admin/citizens", icon: User },
  { name: "System Users", href: "/admin/users", icon: Users },
  { name: "Analytics", href: "/admin/analytics", icon: CreditCard },
  { name: "Departments", href: "/admin/departments", icon: CreditCard },
  {
    name: "Content (CMS)",
    href: "/admin/content",
    icon: Megaphone,
    children: [
      { name: "Pages", href: "/admin/content/pages", icon: FileText },
      { name: "Notices", href: "/admin/content/notices", icon: Megaphone },
    ],
  },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCmsOpen, setIsCmsOpen] = useState(
    pathname.startsWith("/admin/content")
  );
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    if (pathname.startsWith("/admin/content")) setIsCmsOpen(true);
  }, [pathname]);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card text-card-foreground">
      {/* HEADER */}
      <div className="h-16 md:h-20 flex items-center justify-between px-4 md:px-6 border-b border-border">
        <div className="flex items-center gap-2 md:gap-3 group cursor-pointer">
          <div className="h-8 w-8 md:h-10 md:w-10 bg-primary rounded-lg md:rounded-xl flex items-center justify-center text-primary-foreground font-bold text-sm md:text-base shadow-lg elevation-2 group-hover:scale-105 transition-transform">
            SP
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold leading-tight">
              Admin Portal
            </h1>
            <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              Machhapuchhre Modern
            </p>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-accent rounded-lg transition-colors md:hidden"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-2 md:px-3 py-3 md:py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isParentActive = item.children
            ? item.children.some((child) => isActive(child.href))
            : isActive(item.href);

          if (item.children) {
            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => setIsCmsOpen(!isCmsOpen)}
                  className={`w-full group flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-all duration-200 ${
                    isParentActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 md:w-5 md:h-5 flex-shrink-0 ${isParentActive ? "text-primary" : "opacity-70"}`}
                  />
                  <span className="flex-1 text-left truncate">{item.name}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0 transition-transform duration-300 ${isCmsOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isCmsOpen && (
                  <div className="ml-4 md:ml-6 pl-3 md:pl-4 border-l-2 border-border mt-1 space-y-1">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const active = isActive(child.href);
                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm transition-all ${
                            active
                              ? "text-primary font-semibold bg-primary/5"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                          }`}
                        >
                          <ChildIcon className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                          <span className="truncate">{child.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-all duration-200 ${
                isParentActive
                  ? "bg-primary text-primary-foreground shadow-md elevation-2"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon
                className={`w-4 h-4 md:w-5 md:h-5 flex-shrink-0 ${isParentActive ? "text-primary-foreground" : "opacity-70"}`}
              />
              <span className="flex-1 truncate">{item.name}</span>
              {isParentActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* USER SECTION */}
      <div className="p-3 md:p-4 border-t border-border bg-muted/30 space-y-3 md:space-y-4">
        <div className="flex items-center gap-2 md:gap-3 px-2">
          <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-accent border border-border flex items-center justify-center flex-shrink-0">
            <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground" />
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-xs md:text-sm font-bold truncate">Admin User</p>
          </div>
          <button
            onClick={toggleTheme}
            className="hidden md:flex p-1.5 hover:bg-accent rounded-lg transition-colors flex-shrink-0"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 w-full text-xs md:text-sm font-semibold text-destructive hover:bg-destructive/10 rounded-lg md:rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-56 lg:w-64 border-r border-border z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-background border-b border-border z-50 flex items-center px-4 justify-between">
        <div className="font-bold text-lg">Admin Portal</div>
        <button onClick={() => setMobileOpen(true)}>
          <Menu />
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background/50 backdrop-blur-sm">
          <div className="fixed inset-y-0 left-0 w-64 bg-background shadow-lg">
            <div className="p-4 flex justify-end">
              <button onClick={() => setMobileOpen(false)}>
                <X />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}