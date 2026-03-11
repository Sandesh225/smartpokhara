"use client";

import Link from "next/link";
import { 
  Vote, 
  ArrowRight, 
  Plus, 
  Trophy, 
  Clock, 
  Lock,
  Sparkles,
  DollarSign
} from "lucide-react";
import { format, isValid } from "date-fns";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type BudgetCycle } from "@/features/participatory-budgeting";

interface BudgetingContentProps {
  cycles: BudgetCycle[];
}

const formatDateSafe = (dateString: string, formatStr: string = "MMM d, yyyy") => {
  if (!dateString) return "TBD";
  const date = new Date(dateString);
  return isValid(date) ? format(date, formatStr) : "Invalid Date";
};

export default function BudgetingContent({ cycles }: BudgetingContentProps) {
  const sortedCycles = [...cycles].sort((a, b) => {
    if (a.finalized_at && !b.finalized_at) return -1;
    if (a.is_active && !b.is_active) return -1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (sortedCycles.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-20 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-6">
          <Vote className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <h3 className="text-xl font-bold text-foreground">No Active Budget Cycles</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
          There are currently no active fiscal cycles open. 
          Keep an eye on announcements for the next session.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {sortedCycles.map((cycle) => {
        const now = new Date();
        const isFinalized = !!cycle.finalized_at;
        const isSubmissionOpen = !isFinalized && cycle.is_active && now >= new Date(cycle.submission_start_at) && now <= new Date(cycle.submission_end_at);
        const isVotingOpen = !isFinalized && cycle.is_active && now >= new Date(cycle.voting_start_at) && now <= new Date(cycle.voting_end_at);
        const isReviewPhase = !isFinalized && cycle.is_active && !isSubmissionOpen && !isVotingOpen && now < new Date(cycle.voting_start_at);
        
        let statusLabel = "Closed";
        let statusClass = "bg-muted text-muted-foreground border-border";
        let statusIcon = <Lock className="w-3 h-3" />;

        if (isFinalized) {
          statusLabel = "Winners Announced";
          statusClass = "bg-primary/10 text-primary border-primary/20";
          statusIcon = <Trophy className="w-3 h-3" />;
        } else if (isVotingOpen) {
          statusLabel = "Voting Active";
          statusClass = "bg-primary text-primary-foreground border-transparent shadow-sm";
          statusIcon = <Vote className="w-3 h-3 text-primary-foreground" />;
        } else if (isSubmissionOpen) {
          statusLabel = "Submissions Open";
          statusClass = "bg-primary/10 text-primary border-primary/20";
          statusIcon = <Plus className="w-3 h-3" />;
        } else if (isReviewPhase) {
          statusLabel = "Under Review";
          statusClass = "bg-accent/10 text-accent border-accent/20";
          statusIcon = <Clock className="w-3 h-3" />;
        }

        return (
          <div key={cycle.id} className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:border-primary/30 transition-all duration-300">
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                      {cycle.title}
                    </h2>
                    {isFinalized && <Sparkles className="w-4 h-4 text-primary animate-pulse" />}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {cycle.description || "Participate in this fiscal year&apos;s budgeting process."}
                  </p>
                </div>
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shrink-0 shadow-xs",
                  statusClass
                )}>
                  {statusIcon}
                  {statusLabel}
                </span>
              </div>

              <div className="bg-muted/30 border border-border/50 rounded-xl p-5 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                    <DollarSign className="w-3 h-3 text-primary" /> Total Pool
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-foreground tabular-nums">
                      NPR {(cycle.total_budget_amount / 100000).toFixed(1)}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Lakhs</span>
                  </div>
                </div>
                <div className="h-10 w-px bg-border/50" />
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Stage Dates</p>
                  <p className="text-sm font-bold text-foreground">
                    {formatDateSafe(cycle.submission_start_at, "MMM d")} - {formatDateSafe(cycle.voting_end_at, "MMM d")}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-auto px-6 sm:px-8 pb-6 sm:pb-8">
              {isFinalized ? (
                <Button asChild className="w-full h-12 bg-primary hover:opacity-90 text-primary-foreground font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-primary/10">
                  <Link href={`/citizen/participatory-budgeting/${cycle.id}`}>
                    <Trophy className="mr-2 h-4 w-4" /> View Winners
                  </Link>
                </Button>
              ) : isVotingOpen ? (
                <Button asChild className="w-full h-12 bg-primary hover:opacity-90 text-primary-foreground font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-primary/10">
                  <Link href={`/citizen/participatory-budgeting/${cycle.id}`}>
                    <Vote className="mr-2 h-4 w-4" /> Enter Voting Area
                  </Link>
                </Button>
              ) : isSubmissionOpen ? (
                <div className="flex gap-4">
                  <Button asChild variant="outline" className="flex-1 h-12 border-border font-bold uppercase tracking-widest text-xs rounded-xl">
                    <Link href={`/citizen/participatory-budgeting/${cycle.id}`}>
                      Ideas
                    </Link>
                  </Button>
                  <Button asChild className="flex-1 h-12 bg-primary hover:opacity-90 text-primary-foreground font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-primary/10">
                    <Link href={`/citizen/participatory-budgeting/${cycle.id}/new`}>
                      <Plus className="mr-2 h-4 w-4" /> Submit
                    </Link>
                  </Button>
                </div>
              ) : (
                <Button asChild variant="outline" className="w-full h-12 border-border bg-muted/20 hover:bg-muted font-bold uppercase tracking-widest text-xs rounded-xl">
                  <Link href={`/citizen/participatory-budgeting/${cycle.id}`}>
                    {isReviewPhase ? "Review Proposals" : "View Archive"} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
