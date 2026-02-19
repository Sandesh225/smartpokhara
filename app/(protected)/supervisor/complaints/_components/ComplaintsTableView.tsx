"use client";

import { formatDistanceToNow } from "date-fns";
import {
  MoreHorizontal,
  Eye,
  UserPlus,
  ArrowUpRight,
  CheckSquare,
  MapPin,
  Clock,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import { StatusBadge } from "@/components/supervisor/shared/StatusBadge";
import { PriorityIndicator } from "@/components/supervisor/shared/PriorityIndicator";
import { SLACountdown } from "@/components/supervisor/shared/SLACountdown";
import { EmptyState } from "@/components/supervisor/shared/EmptyState";
import { LoadingSpinner } from "@/components/supervisor/shared/LoadingSpinner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Complaint } from "@/features/complaints";
import { memo, useCallback } from "react";
import { useRouter } from "next/navigation";

interface ComplaintsTableViewProps {
  complaints: Complaint[];
  selectedIds: string[];
  onSelect: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  isLoading: boolean;
}

export const ComplaintsTableView = memo(function ComplaintsTableView({
  complaints,
  selectedIds,
  onSelect,
  onSelectAll,
  isLoading,
}: ComplaintsTableViewProps) {
  const router = useRouter();

  const handleMouseEnter = useCallback((id: string) => {
    router.prefetch(`/supervisor/complaints/${id}`);
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-card/5 backdrop-blur-sm min-h-[400px]">
        <LoadingSpinner message="Decrypting Ledger Streams..." />
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 min-h-[400px]">
        <EmptyState
          title="No Records in Perimeter"
          message="Adjust your search parameters or check filters."
        />
      </div>
    );
  }

  const allSelected =
    complaints.length > 0 && selectedIds.length === complaints.length;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* 🏔️ Tactical Table Container */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-muted/40 backdrop-blur-xl sticky top-0 z-20">
              <th className="w-12 px-6 py-5 border-b border-border/60">
                <input
                  type="checkbox"
                  className="rounded border-primary/40 bg-background text-primary focus:ring-primary h-4 w-4 transition-all cursor-pointer"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </th>
              <th className="px-4 py-5 border-b border-border/60">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                  Ref & Objective
                </span>
              </th>
              <th className="px-4 py-5 border-b border-border/60">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                  Jurisdiction
                </span>
              </th>
              <th className="px-4 py-5 border-b border-border/60">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                  Status
                </span>
              </th>
              <th className="px-4 py-5 border-b border-border/60 text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                  Urgency
                </span>
              </th>
              <th className="px-4 py-5 border-b border-border/60">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                  Field Agent
                </span>
              </th>
              <th className="px-4 py-5 border-b border-border/60">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                  SLA Window
                </span>
              </th>
              <th className="w-10 px-6 py-5 border-b border-border/60"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/20">
            {complaints.map((complaint) => (
              <tr
                key={complaint.id}
                onMouseEnter={() => handleMouseEnter(complaint.id)}
                className={cn(
                  "group transition-all duration-300 hover:bg-primary/[0.03] dark:hover:bg-primary/[0.07]",
                  selectedIds.includes(complaint.id)
                    ? "bg-primary/[0.05] dark:bg-primary/[0.12]"
                    : "bg-transparent"
                )}
              >
                {/* Selector */}
                <td className="px-6 py-5">
                  <input
                    type="checkbox"
                    className="rounded border-primary/20 bg-background text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                    checked={selectedIds.includes(complaint.id)}
                    onChange={(e) => onSelect(complaint.id, e.target.checked)}
                  />
                </td>

                {/* Tracking & Subject */}
                <td className="px-4 py-5">
                  <div className="flex flex-col gap-1">
                    <Link
                      href={`/supervisor/complaints/${complaint.id}`}
                      className="inline-flex items-center font-mono text-[11px] font-bold text-primary group-hover:text-primary-brand-light transition-colors tracking-tighter"
                    >
                      #{complaint.tracking_code}
                      <ChevronRight className="h-3 w-3 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                    <span className="text-sm font-bold text-foreground leading-tight line-clamp-1 max-w-[280px]">
                      {complaint.title}
                    </span>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                      <Clock className="h-2.5 w-2.5" />
                      {formatDistanceToNow(new Date(complaint.submitted_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </td>

                {/* Ward & Category */}
                <td className="px-4 py-5">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground/90">
                      <MapPin className="h-3 w-3 text-primary/50" />
                      Ward {complaint.ward?.ward_number || "N/A"}
                    </div>
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-0.5 ml-4.5">
                      {complaint.category?.name || "Uncategorized"}
                    </span>
                  </div>
                </td>

                {/* Status Badge */}
                <td className="px-4 py-5">
                  <StatusBadge status={complaint.status} variant="complaint" />
                </td>

                {/* Priority Indicator */}
                <td className="px-4 py-5">
                  <div className="flex justify-center">
                    <PriorityIndicator
                      priority={complaint.priority}
                      size="sm"
                    />
                  </div>
                </td>

                {/* Assigned Personnel */}
                <td className="px-4 py-5">
                  {complaint.assigned_staff ? (
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20 shadow-sm">
                        {(complaint.assigned_staff?.full_name || complaint.assigned_staff?.profile?.full_name || "?")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-foreground/90">
                          {complaint.assigned_staff?.full_name || complaint.assigned_staff?.profile?.full_name || "Unknown"}
                        </span>
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter">
                          Verified Agent
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="inline-flex items-center px-2 py-1 rounded border border-dashed border-border/60 text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">
                      Pending Dispatch
                    </div>
                  )}
                </td>

                {/* SLA Window */}
                <td className="px-4 py-5">
                  <div className="min-w-[140px]">
                    <SLACountdown
                      deadline={complaint.sla_due_at}
                      status={complaint.status}
                      variant="progress"
                    />
                  </div>
                </td>

                {/* Tactical Actions */}
                <td className="px-6 py-5 text-right">
                  <div className="relative group/menu inline-block">
                    <button className="p-2 rounded-xl hover:bg-primary/10 text-muted-foreground transition-all">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>

                    {/* Floating Command Panel */}
                    <div className="absolute right-0 mt-1 w-52 glass stone-card-elevated opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible scale-95 group-hover/menu:scale-100 transition-all duration-300 z-50 overflow-hidden shadow-2xl">
                      <div className="p-1.5 flex flex-col gap-0.5">
                        <div className="px-3 py-2 text-[8px] font-black text-primary/60 uppercase tracking-[0.2em] border-b border-border/40 mb-1">
                          Node Operations
                        </div>
                        <Link
                          href={`/supervisor/complaints/${complaint.id}`}
                          className="flex items-center px-3 py-2 text-[11px] font-bold text-foreground hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Eye className="mr-3 h-3.5 w-3.5 text-primary" />{" "}
                          Detail Analysis
                        </Link>
                        <button className="flex w-full items-center px-3 py-2 text-[11px] font-bold text-foreground hover:bg-primary/10 rounded-lg transition-colors">
                          <UserPlus className="mr-3 h-3.5 w-3.5 text-primary" />{" "}
                          Reassign Node
                        </button>
                        <button className="flex w-full items-center px-3 py-2 text-[11px] font-bold text-foreground hover:bg-primary/10 rounded-lg transition-colors">
                          <ShieldAlert className="mr-3 h-3.5 w-3.5 text-secondary" />{" "}
                          Emergency Escalation
                        </button>
                        <div className="h-px bg-border/40 my-1" />
                        <button className="flex w-full items-center px-3 py-2 text-[10px] font-black text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all uppercase tracking-widest">
                          <CheckSquare className="mr-3 h-3.5 w-3.5" /> Mark
                          Resolved
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📊 Tactical Footer */}
      <div className="px-6 py-4 bg-muted/20 border-t border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em]">
            Clearance: <span className="text-primary">Supervisor Lvl 4</span>
          </p>
          <div className="h-3 w-px bg-border/60" />
          <p className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest">
            {complaints.length} Streams Active
          </p>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
            <span className="text-[9px] font-black text-primary uppercase tracking-widest">
              {selectedIds.length} Objectives Selected
            </span>
            <button className="px-4 py-1.5 bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-tighter rounded-lg accent-glow transition-transform active:scale-95">
              Bulk Dispatch
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
