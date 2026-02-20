"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Clock, Sun, Cloud, Calendar } from "lucide-react";
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

  const metadata = (
    <div className="flex flex-wrap gap-3">
      <Badge
        variant="outline"
        className="px-3 py-1 text-[10px] font-bold border-2"
      >
        <Calendar className="w-3.5 h-3.5 mr-2" />
        {format(today, "EEEE, d MMMM")}
      </Badge>
      <Badge
        variant="outline"
        className="px-3 py-1 text-[10px] font-bold border-2"
      >
        {isMorning ? (
          <Sun className="h-3.5 w-3.5 mr-2 text-amber-500" />
        ) : (
          <Cloud className="h-3.5 w-3.5 mr-2 text-amber-500" />
        )}
        22°C Pokhara
      </Badge>
    </div>
  );

  const actions = (
    <div
      className={`flex items-center gap-4 rounded-xl border p-3 backdrop-blur-sm transition-all duration-300 ${
        status.isCheckedIn
          ? "bg-emerald-50/60 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
          : "bg-muted/60 border-border shadow-sm"
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full shadow-sm ring-4 ring-card transition-all duration-300 ${
          status.isCheckedIn
            ? "bg-emerald-500 text-white"
            : "bg-muted text-muted-foreground border border-border"
        }`}
      >
        <Clock className="h-5 w-5" />
      </div>
      <div className="hidden xs:block">
        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">
          Duty Status
        </p>
        <div className="flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              status.isCheckedIn
                ? "bg-emerald-500 animate-pulse"
                : "bg-muted-foreground/30"
            }`}
          />
          <p
            className={`font-black text-[10px] uppercase tracking-wider ${
              status.isCheckedIn ? "text-emerald-600" : "text-muted-foreground"
            }`}
          >
            {status.isCheckedIn ? "On Duty" : "Off Duty"}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <PageHeader
      title={
        <div className="flex items-center gap-2">
          {isMorning ? "Namaste" : "Hello"}, {firstName}
          <span className="inline-block animate-wave">👋</span>
        </div>
      }
      description="Here is your daily briefing. You have pending tasks in your queue."
      metadata={metadata}
      actions={actions}
      className="overflow-hidden"
    >
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-secondary/10 blur-3xl" />
    </PageHeader>
  );
}