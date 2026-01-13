"use client";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { User, ArrowUpDown, Users, Star, LayoutGrid, List } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TeamMember {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  availability_status: string;
  current_workload: number;
  performance_rating: number;
}

interface TeamOverviewProps {
  staff: TeamMember[];
}

/**
 * Enhanced Workload Progress Bar
 */
function WorkloadBar({ current, max = 10 }: { current: number; max?: number }) {
  const percentage = Math.min((current / max) * 100, 100);

  // Semantic color logic for Machhapuchhre Modern
  const barColor =
    percentage >= 90
      ? "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.4)]"
      : percentage >= 70
      ? "bg-orange-500"
      : "bg-emerald-500";

  return (
    <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden border border-border/20">
      <div
        className={cn("h-full transition-all duration-700 ease-out", barColor)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function EmptyTeamState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 border border-primary/20">
        <Users className="w-8 h-8 text-primary" />
      </div>
      <h4 className="text-sm font-bold text-foreground mb-1">
        No Unit Assigned
      </h4>
      <p className="text-xs text-muted-foreground max-w-[240px]">
        Team metrics will populate once staff members are mapped to your
        jurisdiction.
      </p>
    </div>
  );
}

export function TeamOverview({ staff }: TeamOverviewProps) {
  const [sortBy, setSortBy] = useState<"workload" | "rating">("workload");
  const [isSorting, setIsSorting] = useState(false);

  const handleSort = (newSortBy: "workload" | "rating") => {
    if (newSortBy === sortBy) return;
    setIsSorting(true);
    setSortBy(newSortBy);
    setTimeout(() => setIsSorting(false), 400);
  };

  const sortedStaff = [...staff].sort((a, b) => {
    return sortBy === "workload"
      ? b.current_workload - a.current_workload
      : b.performance_rating - a.performance_rating;
  });

  return (
    <div className="stone-card overflow-hidden shadow-xl border-border/40">
      {/* Table Header Section */}
      <div className="px-6 py-5 border-b border-border/50 bg-linear-to-b from-muted/30 to-transparent">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Users className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Personnel Overview
              </h3>
              <p className="text-[10px] uppercase tracking-tighter text-muted-foreground font-black">
                {staff.length} Active Officers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[10px] font-black uppercase text-muted-foreground/60 mr-1">
              Sort By:
            </label>
            <select
              value={sortBy}
              onChange={(e) =>
                handleSort(e.target.value as "workload" | "rating")
              }
              className="text-[11px] font-bold border border-border bg-card text-foreground rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
            >
              <option value="workload">Workload Intensity</option>
              <option value="rating">Performance Score</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        {staff.length === 0 ? (
          <EmptyTeamState />
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 text-[10px] uppercase tracking-widest font-black text-muted-foreground border-b border-border/50">
                <th className="px-6 py-3">Agent Details</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Workload Distribution</th>
                <th className="px-6 py-3 text-right">KPI Score</th>
              </tr>
            </thead>
            <tbody
              className={cn(
                "divide-y divide-border/30 transition-opacity duration-300",
                isSorting && "opacity-40"
              )}
            >
              {sortedStaff.map((member) => (
                <tr
                  key={member.user_id}
                  className="group hover:bg-muted/40 transition-all cursor-default"
                >
                  {/* Name & Avatar */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-9 w-9 rounded-xl bg-muted border border-border/50 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-primary/50 transition-colors">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {member.full_name}
                      </span>
                    </div>
                  </td>

                  {/* Availability Status */}
                  <td className="px-6 py-4">
                    <StatusBadge
                      status={member.availability_status}
                      variant="staff"
                      className="text-[10px] font-black uppercase"
                    />
                  </td>

                  {/* Workload Progress */}
                  <td className="px-6 py-4 min-w-[180px]">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-muted-foreground">
                          {member.current_workload} Active Cases
                        </span>
                        <span
                          className={cn(
                            member.current_workload >= 8
                              ? "text-destructive"
                              : "text-foreground"
                          )}
                        >
                          {Math.round((member.current_workload / 10) * 100)}%
                        </span>
                      </div>
                      <WorkloadBar current={member.current_workload} />
                    </div>
                  </td>

                  {/* Performance Score */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span className="font-mono text-sm font-black text-foreground">
                          {Number(member.performance_rating).toFixed(1)}
                        </span>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "h-1 w-2 rounded-full",
                              i < Math.round(member.performance_rating)
                                ? "bg-primary shadow-[0_0_5px_rgba(var(--primary),0.3)]"
                                : "bg-muted"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer / Meta Data */}
      <div className="px-6 py-3 border-t border-border/50 bg-muted/10 flex justify-between items-center">
        <p className="text-[10px] text-muted-foreground font-bold italic">
          Data synchronized with departmental HR records
        </p>
        <button className="text-[10px] font-black uppercase text-primary hover:underline underline-offset-4">
          Full Roster Audit
        </button>
      </div>
    </div>
  );
}