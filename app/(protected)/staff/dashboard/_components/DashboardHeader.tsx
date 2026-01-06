"use client";

import { Sun, Clock } from "lucide-react";
import { format } from "date-fns";
import type { CurrentUser } from "@/lib/types/auth";

interface DashboardHeaderProps {
  user: CurrentUser;
  status: { isCheckedIn: boolean; checkInTime?: string };
}

export function DashboardHeader({ user, status }: DashboardHeaderProps) {
  const firstName = user.profile?.full_name?.split(" ")[0] || "Staff";
  const today = new Date();
  const isMorning = today.getHours() < 12;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm p-6 sm:p-8">
      {/* Background decoration gradients */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-blue-50 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-indigo-50 blur-3xl opacity-50" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Greeting Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-blue-600">
            <span>{format(today, "EEEE, d MMMM")}</span>
            <span className="h-1 w-1 rounded-full bg-blue-300" />
            <span className="flex items-center gap-1.5 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
              <Sun className="h-3 w-3 text-amber-500" />
              <span className="text-amber-700 font-medium normal-case">22°C Pokhara</span>
            </span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {isMorning ? "Namaste" : "Hello"}, {firstName} <span className="inline-block animate-wave">👋</span>
          </h1>
          
          <p className="text-sm text-gray-500 max-w-lg leading-relaxed">
            Here is your daily briefing. You have pending tasks in your queue.
          </p>
        </div>

        {/* Status Card - Visual indicator of attendance */}
        <div className={`flex items-center gap-4 rounded-xl border p-4 backdrop-blur-sm transition-colors ${
          status.isCheckedIn 
            ? "bg-emerald-50/60 border-emerald-100" 
            : "bg-gray-50/60 border-gray-100"
        }`}>
          <div className={`flex h-12 w-12 items-center justify-center rounded-full shadow-sm ring-4 ring-white ${
             status.isCheckedIn ? "bg-emerald-500 text-white" : "bg-white text-gray-300 border border-gray-100"
          }`}>
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Current Status</p>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${
                status.isCheckedIn ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
              }`} />
              <p className={`font-bold text-sm ${status.isCheckedIn ? "text-emerald-700" : "text-gray-600"}`}>
                {status.isCheckedIn ? "On Duty" : "Off Duty"}
              </p>
            </div>
            {status.isCheckedIn && status.checkInTime && (
              <p className="text-xs text-emerald-600 mt-0.5 font-mono">
                Since {format(new Date(status.checkInTime), "HH:mm")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}