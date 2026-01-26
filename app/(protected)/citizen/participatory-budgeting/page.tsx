"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, isValid } from "date-fns";
import { Loader2, Calendar, DollarSign, Vote, ArrowRight, Plus } from "lucide-react";
// Adjusted relative paths to ensure we reach the project root
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { pbService, type BudgetCycle } from "../../../../lib/supabase/queries/participatory-budgeting";

// Safe date formatter to prevent "202" or crashes
const formatDateSafe = (dateString: string, formatStr: string = "MMM d, yyyy") => {
  if (!dateString) return "TBD";
  const date = new Date(dateString);
  return isValid(date) ? format(date, formatStr) : "Invalid Date";
};

export default function ParticipatoryBudgetingPage() {
  const [cycles, setCycles] = useState<BudgetCycle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCycles() {
      try {
        const data = await pbService.getActiveCycles();
        setCycles(data);
      } catch (error) {
        console.error("Failed to load cycles", error);
      } finally {
        setLoading(false);
      }
    }
    loadCycles();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-foreground mb-2">Participatory Budgeting</h1>
        <p className="text-muted-foreground">
          Propose ideas and vote on how to spend the city budget for your community.
        </p>
      </div>

      {cycles.length === 0 ? (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Vote className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Active Budget Cycles</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              There are currently no active participatory budgeting cycles. Please check back later for upcoming fiscal year announcements.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {cycles.map((cycle) => {
            const now = new Date();
            const isSubmissionOpen = now >= new Date(cycle.submission_start_at) && now <= new Date(cycle.submission_end_at);
            const isVotingOpen = now >= new Date(cycle.voting_start_at) && now <= new Date(cycle.voting_end_at);
            
            return (
              <Card key={cycle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="bg-primary/5 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-2">{cycle.title}</CardTitle>
                      <CardDescription>{cycle.description}</CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge variant={cycle.is_active ? "default" : "secondary"}>
                        {cycle.is_active ? "Active Cycle" : "Closed"}
                      </Badge>
                      {isSubmissionOpen && <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">Submissions Open</Badge>}
                      {isVotingOpen && <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">Voting Open</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid sm:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Total Budget
                      </span>
                      <p className="text-2xl font-bold text-primary">
                        NPR {cycle.total_budget_amount.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Submission Period
                      </span>
                      <p className="text-sm font-medium">
                        {formatDateSafe(cycle.submission_start_at, "MMM d")} - {formatDateSafe(cycle.submission_end_at, "MMM d, yyyy")}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Vote className="w-3 h-3" /> Voting Period
                      </span>
                      <p className="text-sm font-medium">
                        {formatDateSafe(cycle.voting_start_at, "MMM d")} - {formatDateSafe(cycle.voting_end_at, "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/20 flex justify-end gap-3 p-4">
                  {isSubmissionOpen && (
                    <Button variant="outline" asChild className="gap-2">
                      <Link href={`/citizen/participatory-budgeting/${cycle.id}/new`}>
                        <Plus className="w-4 h-4" /> Submit Proposal
                      </Link>
                    </Button>
                  )}
                  <Button asChild>
                    <Link href={`/citizen/participatory-budgeting/${cycle.id}`}>
                      View Proposals & Vote <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}