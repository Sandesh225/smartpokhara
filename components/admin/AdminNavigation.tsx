"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Users,
  Briefcase,
  Settings,
  LogOut,
  CreditCard,
  Megaphone,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

type NavItem = {
  name: string;
  href: string;
  icon: any;
  children?: { name: string; href: string; icon: any }[];
};

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Complaints", href: "/admin/complaints", icon: FileText },
  { name: "Tasks", href: "/admin/tasks", icon: CheckSquare },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Staff Management", href: "/admin/staff", icon: Briefcase },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
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

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export default function AdminNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [mobileOpen, setMobileOpen] = useState(false);

  const contentDefaultOpen = useMemo(
    () => pathname.startsWith("/admin/content"),
    [pathname]
  );
  const [contentOpen, setContentOpen] = useState(contentDefaultOpen);

  useEffect(() => {
    if (pathname.startsWith("/admin/content")) setContentOpen(true);
    setMobileOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const NavLinks = ({ isMobile = false }: { isMobile?: boolean }) => (
    <nav className={cx(isMobile ? "py-4 px-3" : "py-6 px-3", "space-y-1")}>
      {navItems.map((item) => {
        const parentActive =
          isActive(item.href) ||
          item.children?.some((c) => isActive(c.href)) ||
          false;

        if (item.children?.length) {
          return (
            <div key={item.name} className="space-y-1">
              <button
                type="button"
                onClick={() => setContentOpen((v) => !v)}
                aria-expanded={contentOpen}
                className={cx(
                  "group flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium transition-all duration-200",
                  parentActive
                    ? "bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700 shadow-sm ring-1 ring-blue-200/50"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:scale-[0.98]"
                )}
              >
                <item.icon
                  className={cx(
                    "w-5 h-5 transition-colors",
                    parentActive
                      ? "text-blue-600"
                      : "text-gray-400 group-hover:text-gray-600"
                  )}
                />
                <span className="flex-1 text-left">{item.name}</span>
                <ChevronDown
                  className={cx(
                    "w-4 h-4 transition-transform",
                    contentOpen && "rotate-180"
                  )}
                />
              </button>

              {contentOpen && (
                <div className="pl-3 space-y-1">
                  {item.children.map((child) => {
                    const childActive = isActive(child.href);
                    return (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cx(
                          "group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                          childActive
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200/50"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <child.icon
                          className={cx(
                            "w-4 h-4 transition-colors",
                            childActive
                              ? "text-blue-600"
                              : "text-gray-400 group-hover:text-gray-600"
                          )}
                        />
                        <span className="flex-1">{child.name}</span>
                        {childActive && (
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-sm" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        const active = isActive(item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cx(
              "group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
              active
                ? "bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700 shadow-sm ring-1 ring-blue-200/50"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:scale-[0.98]"
            )}
          >
            <item.icon
              className={cx(
                "w-5 h-5 transition-colors",
                active
                  ? "text-blue-600"
                  : "text-gray-400 group-hover:text-gray-600"
              )}
            />
            <span className="flex-1">{item.name}</span>
            {active && (
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-sm" />
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
            SP
          </div>
          <span className="font-bold text-lg text-gray-900">Smart Pokhara</span>
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-xs bg-white shadow-xl border-r border-gray-200 flex flex-col">
            <div className="h-16 px-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                  SP
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-gray-900 leading-tight">
                    Admin Portal
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">
                    Smart Pokhara
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <NavLinks isMobile />
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-red-600 hover:bg-red-50 active:bg-red-100 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-offset-2"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 flex-col w-64 h-screen bg-white border-r border-gray-200 z-40 shadow-sm">
        <div className="h-16 flex items-center px-5 border-b border-gray-100 bg-gradient-to-r from-white to-blue-50/30">
          <div className="h-9 w-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold shadow-md ring-2 ring-blue-100 ring-offset-2">
            SP
          </div>
          <div className="ml-3 flex flex-col">
            <span className="text-base font-bold text-gray-900 leading-tight">
              Admin Portal
            </span>
            <span className="text-[10px] text-gray-500 font-medium">
              Smart Pokhara
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <NavLinks />
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-red-600 hover:bg-red-50 active:bg-red-100 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-offset-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
