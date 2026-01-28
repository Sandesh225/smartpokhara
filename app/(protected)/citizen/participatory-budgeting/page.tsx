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
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// Backend Service
import { pbService, type BudgetCycle } from "@/lib/supabase/queries/participatory-budgeting";

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
  const [cycles, setCycles] = useState<BudgetCycle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCycles() {
      try {
        const data = await pbService.getActiveCycles();
        // Sort: Finalized & Active first, then by creation date
        const sorted = data.sort((a, b) => {
          if (a.finalized_at && !b.finalized_at) return -1;
          if (a.is_active && !b.is_active) return -1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setCycles(sorted);
      } catch (error) {
        console.error("Failed to load cycles", error);
      } finally {
        setLoading(false);
      }
    }
    loadCycles();
  }, []);

  // --- Loading State ---
  if (loading) {
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
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/5 to-background pt-16 pb-12 px-4 border-b border-primary/10">
        <div className="container max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <Megaphone className="w-3 h-3" /> Citizen Voice
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight leading-tight">
              Participatory <span className="text-primary">Budgeting</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Empowering the citizens of Pokhara to directly decide how public funds are spent. 
              Submit your ideas, vote for your priorities, and track the progress of winning projects.
            </p>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 -mt-8">
        {cycles.length === 0 ? (
          // --- Empty State ---
          <Card className="border-2 border-dashed bg-card/50 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-muted rounded-full p-6 mb-6">
                <Vote className="w-12 h-12 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-bold text-foreground">No Active Budget Cycles</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                There are currently no active fiscal cycles open for participation. 
                Please check back later for the next fiscal year announcement.
              </p>
            </CardContent>
          </Card>
        ) : (
          // --- Cycles Grid ---
          <div className="grid gap-8 lg:grid-cols-2">
            {cycles.map((cycle) => {
              const now = new Date();
              
              // Phase Calculations
              const isFinalized = !!cycle.finalized_at;
              const isSubmissionOpen = !isFinalized && cycle.is_active && now >= new Date(cycle.submission_start_at) && now <= new Date(cycle.submission_end_at);
              const isVotingOpen = !isFinalized && cycle.is_active && now >= new Date(cycle.voting_start_at) && now <= new Date(cycle.voting_end_at);
              const isReviewPhase = !isFinalized && cycle.is_active && !isSubmissionOpen && !isVotingOpen && now < new Date(cycle.voting_start_at);
              const isClosed = !cycle.is_active || (now > new Date(cycle.voting_end_at) && !isFinalized);

              // Styling Logic based on Phase
              let cardStyle = "border-muted shadow-sm hover:shadow-md";
              let headerStyle = "bg-muted/30";
              let statusIcon = <Lock className="w-5 h-5 text-muted-foreground" />;
              let statusText = "Closed";
              let statusColor = "text-muted-foreground";

              if (isFinalized) {
                cardStyle = "border-amber-400 border-2 shadow-amber-100/50 dark:shadow-amber-900/20 hover:shadow-xl hover:scale-[1.01]";
                headerStyle = "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/20";
                statusIcon = <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
                statusText = "Winners Announced";
                statusColor = "text-amber-700 dark:text-amber-400";
              } else if (isVotingOpen) {
                cardStyle = "border-blue-500 border-2 shadow-blue-100/50 dark:shadow-blue-900/20 hover:shadow-xl hover:scale-[1.01]";
                headerStyle = "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/20";
                statusIcon = <Vote className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
                statusText = "Voting Active";
                statusColor = "text-blue-700 dark:text-blue-400";
              } else if (isSubmissionOpen) {
                cardStyle = "border-emerald-500 border-2 shadow-emerald-100/50 dark:shadow-emerald-900/20 hover:shadow-xl hover:scale-[1.01]";
                headerStyle = "bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/20";
                statusIcon = <Plus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
                statusText = "Submissions Open";
                statusColor = "text-emerald-700 dark:text-emerald-400";
              } else if (isReviewPhase) {
                cardStyle = "border-purple-300 shadow-purple-100/50 dark:shadow-purple-900/20";
                headerStyle = "bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/20";
                statusIcon = <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
                statusText = "In Review";
                statusColor = "text-purple-700 dark:text-purple-400";
              }

              return (
                <Card key={cycle.id} className={`flex flex-col overflow-hidden transition-all duration-300 ${cardStyle}`}>
                  {/* Card Header */}
                  <div className={`px-6 py-5 ${headerStyle} border-b`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        {isFinalized && <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />}
                        <h2 className="text-xl font-bold text-foreground line-clamp-1" title={cycle.title}>
                          {cycle.title}
                        </h2>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`bg-background/80 backdrop-blur-sm border-0 font-bold px-3 py-1 flex items-center gap-1.5 shadow-sm ${statusColor}`}
                      >
                        {statusIcon}
                        {statusText}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                      {cycle.description || "Participate in this fiscal year's budgeting process."}
                    </p>
                  </div>

                  <CardContent className="flex-1 pt-6 px-6">
                    {/* Budget Highlight */}
                    <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-transparent border border-muted-foreground/10">
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Total Fiscal Allocation
                      </p>
                      <p className="text-3xl font-black text-foreground">
                        NPR {(cycle.total_budget_amount / 100000).toFixed(1)} <span className="text-lg font-bold text-muted-foreground">Lakhs</span>
                      </p>
                    </div>

                    {/* Timeline Grid */}
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                      <div className="space-y-1">
                        <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isSubmissionOpen ? "text-emerald-600" : "text-muted-foreground"}`}>
                          <Calendar className="w-3 h-3" /> Submission
                        </span>
                        <p className="text-sm font-medium">
                          {formatDateSafe(cycle.submission_start_at, "MMM d")} - {formatDateSafe(cycle.submission_end_at, "MMM d")}
                        </p>
                        {isSubmissionOpen && (
                          <p className="text-[10px] text-emerald-600 font-semibold animate-pulse">
                            Closes {getTimeRemaining(cycle.submission_end_at)}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isVotingOpen ? "text-blue-600" : "text-muted-foreground"}`}>
                          <Vote className="w-3 h-3" /> Voting
                        </span>
                        <p className="text-sm font-medium">
                          {formatDateSafe(cycle.voting_start_at, "MMM d")} - {formatDateSafe(cycle.voting_end_at, "MMM d")}
                        </p>
                        {isVotingOpen && (
                          <p className="text-[10px] text-blue-600 font-semibold animate-pulse">
                            Ends {getTimeRemaining(cycle.voting_end_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>

                  <Separator />

                  <CardFooter className="bg-muted/5 p-6 pt-4">
                    {/* Dynamic Action Buttons */}
                    <div className="w-full grid grid-cols-1 gap-3">
                      {isFinalized ? (
                        <Button asChild size="lg" className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold shadow-md">
                          <Link href={`/citizen/participatory-budgeting/${cycle.id}`} className="flex items-center justify-center">
                            <Trophy className="mr-2 h-5 w-5" /> View Winners & Results
                          </Link>
                        </Button>
                      ) : isVotingOpen ? (
                        <Button asChild size="lg" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-md">
                          <Link href={`/citizen/participatory-budgeting/${cycle.id}`} className="flex items-center justify-center">
                            <Vote className="mr-2 h-5 w-5" /> Cast Your Votes
                          </Link>
                        </Button>
                      ) : isSubmissionOpen ? (
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button asChild size="lg" variant="outline" className="flex-1 border-2">
                            <Link href={`/citizen/participatory-budgeting/${cycle.id}`}>
                              View Proposals
                            </Link>
                          </Button>
                          <Button asChild size="lg" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                            <Link href={`/citizen/participatory-budgeting/${cycle.id}/new`}>
                              <Plus className="mr-2 h-5 w-5" /> Submit Proposal
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <Button asChild variant="outline" className="w-full border-2 hover:bg-muted">
                          <Link href={`/citizen/participatory-budgeting/${cycle.id}`} className="flex items-center justify-center">
                            {isReviewPhase ? "View Submitted Proposals" : "View Archive"} <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}