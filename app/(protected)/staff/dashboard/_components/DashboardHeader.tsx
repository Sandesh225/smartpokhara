"use client";

import { Sun, Cloud, Clock } from "lucide-react";
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
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border shadow-sm p-6 sm:p-8 transition-all duration-300">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-primary/10 dark:bg-primary/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-secondary/10 dark:bg-secondary/5 blur-3xl" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Greeting Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-primary dark:text-primary/90">
            <span>{format(today, "EEEE, d MMMM")}</span>
            <span className="h-1 w-1 rounded-full bg-primary/30" />
            <span className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-500/20">
              {isMorning ? (
                <Sun className="h-3 w-3 text-amber-500" />
              ) : (
                <Cloud className="h-3 w-3 text-amber-500" />
              )}
              <span className="text-amber-700 dark:text-amber-400 font-medium normal-case">
                22°C Pokhara
              </span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {isMorning ? "Namaste" : "Hello"}, {firstName}{" "}
            <span className="inline-block animate-wave">👋</span>
          </h1>

          <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
            Here is your daily briefing. You have pending tasks in your queue.
          </p>
        </div>

        {/* Status Card */}
        <div
          className={`flex items-center gap-4 rounded-xl border p-4 backdrop-blur-sm transition-all duration-300 ${
            status.isCheckedIn
              ? "bg-emerald-50/60 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
              : "bg-muted/60 border-border"
          }`}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full shadow-sm ring-4 ring-card transition-all duration-300 ${
              status.isCheckedIn
                ? "bg-emerald-500 dark:bg-emerald-600 text-white"
                : "bg-muted dark:bg-muted/50 text-muted-foreground border border-border"
            }`}
          >
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Current Status
            </p>
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  status.isCheckedIn
                    ? "bg-emerald-500 dark:bg-emerald-400 animate-pulse"
                    : "bg-muted-foreground/30"
                }`}
              />
              <p
                className={`font-bold text-sm transition-colors ${
                  status.isCheckedIn
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-muted-foreground"
                }`}
              >
                {status.isCheckedIn ? "On Duty" : "Off Duty"}
              </p>
            </div>
            {status.isCheckedIn && status.checkInTime && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
                Since {format(new Date(status.checkInTime), "HH:mm")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}