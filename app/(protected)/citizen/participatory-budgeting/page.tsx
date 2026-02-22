"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, isValid, formatDistanceToNow } from "date-fns";
import { 
  Loader2, 
  Calendar, 
  DollarSign, 
  Vote, 
  ArrowRight, 
  Plus, 
  Trophy, 
  Megaphone, 
  Clock, 
  CheckCircle2, 
  Lock,
  Sparkles
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// Domain Features
import { useBudgetCycles, type BudgetCycle } from "@/features/participatory-budgeting";

// --- Utility: Safe Date Formatting ---
const formatDateSafe = (dateString: string, formatStr: string = "MMM d, yyyy") => {
  if (!dateString) return "TBD";
  const date = new Date(dateString);
  return isValid(date) ? format(date, formatStr) : "Invalid Date";
};

const getTimeRemaining = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (!isValid(date) || date < new Date()) return "Ended";
  return formatDistanceToNow(date, { addSuffix: true });
};

export default function ParticipatoryBudgetingPage() {
  const { data: cycles = [], isLoading } = useBudgetCycles();

  // Sort cycles: Finalized & Active first, then by creation date
  const sortedCycles = [...cycles].sort((a, b) => {
    if (a.finalized_at && !b.finalized_at) return -1;
    if (a.is_active && !b.is_active) return -1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });


  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="mb-12 space-y-4">
          <Skeleton className="h-10 w-2/3 max-w-md" />
          <Skeleton className="h-6 w-full max-w-2xl" />
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-[300px] w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 1. Refined Hero Section */}
      <div className="relative overflow-hidden bg-card pt-16 pb-20 px-6 border-b border-border">
        {/* Subtle dynamic background element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
              <Megaphone className="w-3.5 h-3.5" /> Citizen Voice
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-none uppercase">
              Participatory <span className="text-primary">Budgeting</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-medium max-w-2xl">
              Empowering the citizens of Pokhara to directly decide how public funds are spent. 
              Submit ideas, vote for priorities, and track winning projects.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Content Section */}
      <div className="max-w-6xl mx-auto px-6 mt-10 overflow-visible pb-24">
        {sortedCycles.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-20 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-6">
              <Vote className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No Active Budget Cycles</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
              There are currently no active fiscal cycles open. 
              Keep an eye on announcements for the next session.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {sortedCycles.map((cycle) => {
              const now = new Date();
              const isFinalized = !!cycle.finalized_at;
              const isSubmissionOpen = !isFinalized && cycle.is_active && now >= new Date(cycle.submission_start_at) && now <= new Date(cycle.submission_end_at);
              const isVotingOpen = !isFinalized && cycle.is_active && now >= new Date(cycle.voting_start_at) && now <= new Date(cycle.voting_end_at);
              const isReviewPhase = !isFinalized && cycle.is_active && !isSubmissionOpen && !isVotingOpen && now < new Date(cycle.voting_start_at);
              const isClosed = !cycle.is_active || (now > new Date(cycle.voting_end_at) && !isFinalized);

              let statusLabel = "Closed";
              let statusClass = "bg-muted text-muted-foreground border-border";
              let statusIcon = <Lock className="w-3 h-3" />;

              if (isFinalized) {
                statusLabel = "Winners Announced";
                statusClass = "bg-amber-100 text-amber-700 border-amber-200/50";
                statusIcon = <Trophy className="w-3 h-3" />;
              } else if (isVotingOpen) {
                statusLabel = "Voting Active";
                statusClass = "bg-primary/10 text-primary border-primary/20";
                statusIcon = <Vote className="w-3 h-3" />;
              } else if (isSubmissionOpen) {
                statusLabel = "Submissions Open";
                statusClass = "bg-emerald-100 text-emerald-700 border-emerald-200/50";
                statusIcon = <Plus className="w-3 h-3" />;
              } else if (isReviewPhase) {
                statusLabel = "Under Review";
                statusClass = "bg-purple-100 text-purple-700 border-purple-200/50";
                statusIcon = <Clock className="w-3 h-3" />;
              }

              return (
                <div key={cycle.id} className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-xs hover:border-primary/20 transition-all">
                  <div className="p-6 md:p-8 space-y-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-black text-foreground tracking-tight uppercase group-hover:text-primary transition-colors">
                            {cycle.title}
                          </h2>
                          {isFinalized && <Sparkles className="w-4 h-4 text-amber-500" />}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {cycle.description || "Participate in this fiscal year's budgeting process."}
                        </p>
                      </div>
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-widest border shrink-0",
                        statusClass
                      )}>
                        {statusIcon}
                        {statusLabel}
                      </span>
                    </div>

                    <div className="bg-muted/30 border border-border/50 rounded-xl p-5 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                          <DollarSign className="w-3 h-3 text-primary" /> Total Pool
                        </p>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-black text-foreground tabular-nums">
                            NPR {(cycle.total_budget_amount / 100000).toFixed(1)}
                          </span>
                          <span className="text-xs font-bold text-muted-foreground uppercase">Lakhs</span>
                        </div>
                      </div>
                      <div className="h-10 w-px bg-border/50" />
                      <div className="space-y-1 text-right">
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Stage Dates</p>
                        <p className="text-sm font-bold text-foreground">
                          {formatDateSafe(cycle.submission_start_at, "MMM d")} - {formatDateSafe(cycle.voting_end_at, "MMM d")}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 px-1">
                      <div className="space-y-1">
                        <p className={cn(
                          "text-xs font-black uppercase tracking-widest flex items-center gap-1.5",
                          isSubmissionOpen ? "text-emerald-600" : "text-muted-foreground/60"
                        )}>
                          Submission
                        </p>
                        <p className="text-xs font-bold">{formatDateSafe(cycle.submission_start_at, "MMM d")} - {formatDateSafe(cycle.submission_end_at, "MMM d")}</p>
                      </div>
                      <div className="space-y-1">
                        <p className={cn(
                          "text-xs font-black uppercase tracking-widest flex items-center gap-1.5",
                          isVotingOpen ? "text-primary" : "text-muted-foreground/60"
                        )}>
                          Voting
                        </p>
                        <p className="text-xs font-bold">{formatDateSafe(cycle.voting_start_at, "MMM d")} - {formatDateSafe(cycle.voting_end_at, "MMM d")}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto px-6 md:px-8 pb-6 md:pb-8">
                    {isFinalized ? (
                      <Button asChild className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-amber-500/10">
                        <Link href={`/citizen/participatory-budgeting/${cycle.id}`}>
                          <Trophy className="mr-2 h-3.5 w-3.5" /> View Results
                        </Link>
                      </Button>
                    ) : isVotingOpen ? (
                      <Button asChild className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-primary/10">
                        <Link href={`/citizen/participatory-budgeting/${cycle.id}`}>
                          <Vote className="mr-2 h-3.5 w-3.5" /> Enter Voting Area
                        </Link>
                      </Button>
                    ) : isSubmissionOpen ? (
                      <div className="flex gap-3">
                        <Button asChild variant="outline" className="flex-1 h-11 border-border font-bold uppercase tracking-widest text-xs rounded-xl">
                          <Link href={`/citizen/participatory-budgeting/${cycle.id}`}>
                            See Ideas
                          </Link>
                        </Button>
                        <Button asChild className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-emerald-600/10">
                          <Link href={`/citizen/participatory-budgeting/${cycle.id}/new`}>
                            <Plus className="mr-2 h-3.5 w-3.5" /> Submit Idea
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <Button asChild variant="outline" className="w-full h-11 border-border bg-muted/20 hover:bg-muted font-bold uppercase tracking-widest text-xs rounded-xl">
                        <Link href={`/citizen/participatory-budgeting/${cycle.id}`}>
                          {isReviewPhase ? "Review Proposals" : "View Archive"} <ArrowRight className="ml-2 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>

  );
}