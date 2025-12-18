"use client";
import { Bell, Menu, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  user: any;
  toggleSidebar?: () => void;
  notificationsCount?: number;
}

export function StaffHeader({ user, toggleSidebar, notificationsCount = 0 }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        {toggleSidebar && (
          <button onClick={toggleSidebar} className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Menu className="h-6 w-6" />
          </button>
        )}
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">SP</div>
           <span className="font-bold text-lg text-gray-900 hidden sm:block">Smart Pokhara</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="h-5 w-5" />
          {notificationsCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          )}
        </button>
        
        <div className="w-px h-6 bg-gray-200 mx-1" />
        
        <Link href="/staff/profile" className="flex items-center gap-2 group">
           <div className="text-right hidden sm:block">
             <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{user.full_name}</p>
             <p className="text-xs text-gray-500">{user.role}</p>
           </div>
           <div className="w-9 h-9 bg-gray-100 rounded-full overflow-hidden border border-gray-200 group-hover:border-blue-300 transition-colors flex items-center justify-center">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="h-5 w-5 text-gray-400" />
              )}
           </div>
        </Link>
      </div>
    </header>
  );
}