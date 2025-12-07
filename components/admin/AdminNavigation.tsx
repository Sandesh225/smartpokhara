"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Users,
  Briefcase, // New icon for Staff
  Settings,
  LogOut,
  Bell,
  CreditCard,
  Megaphone,
  Menu
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Complaints", href: "/admin/complaints", icon: FileText },
  { name: "Tasks", href: "/admin/tasks", icon: CheckSquare },
  // Split Users & Staff
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Staff Management", href: "/admin/staff", icon: Briefcase },
  
  { name: "Payments", href: "/admin/finance", icon: CreditCard },
  { name: "Notices (CMS)", href: "/admin/cms", icon: Megaphone },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
        <span className="font-bold text-xl text-blue-700">Smart Pokhara</span>
        <button className="p-2 text-gray-600"><Menu className="w-6 h-6" /></button>
      </div>

      <aside className="hidden md:flex fixed top-0 left-0 flex-col w-64 h-screen bg-white border-r border-gray-200 z-40">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold mr-3 shadow-sm">SP</div>
          <span className="text-lg font-bold text-gray-900">Admin Portal</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>
                <item.icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100">
           <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2.5 w-full text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg mt-1 transition-colors">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}