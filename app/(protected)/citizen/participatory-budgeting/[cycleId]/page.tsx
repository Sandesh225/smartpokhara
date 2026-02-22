"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ArrowLeft,
  Plus,
  Loader2,
  ThumbsUp,
  MapPin,
  Tag,
  AlertCircle,
  Check,
  DollarSign,
  Trophy,
  Sparkles,
  TrendingUp,
  Target,
  ArrowRight,
  CheckCircle2,
  Building2,
  Award,
  Clock,
  PieChart,
  Megaphone,
  Vote,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
// Domain Features
import { 
  useBudgetCycle, 
  usePBProposals, 
  usePBVotes, 
  usePBMutations,
  type BudgetCycle,
  type BudgetProposal
} from "@/features/participatory-budgeting";

export default function CycleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const cycleId = params.cycleId as string;

  // --- Data Fetching Hooks ---
  const { data: cycle, isLoading: cycleLoading } = useBudgetCycle(cycleId);
  const { data: proposals = [], isLoading: proposalsLoading } = usePBProposals(cycleId, null);
  const { data: userVotes = [], isLoading: votesLoading } = usePBVotes(cycleId);
  const { vote: voteMutation } = usePBMutations();

  const loading = cycleLoading || proposalsLoading || votesLoading;

  // --- Voting Logic ---
  const handleVote = async (proposalId: string) => {
    if (!cycle) return;

    if (userVotes.length >= cycle.max_votes_per_user) {
      toast.error(`You have used all ${cycle.max_votes_per_user} votes for this cycle.`);
      return;
    }

    voteMutation.mutate(proposalId);
  };


  // --- Loading State ---
  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-purple-500/20 blur-3xl animate-pulse" />
          <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10" />
        </div>
        <p className="text-muted-foreground font-medium animate-pulse">Loading Cycle Data...</p>
      </div>
    );
  }

  if (!cycle) return <div className="p-8 text-center text-muted-foreground">Cycle not found.</div>;

  // --- Logic & Calculations ---
  const now = new Date();
  const submissionOpen = now >= new Date(cycle.submission_start_at) && now <= new Date(cycle.submission_end_at);
  const votingOpen = now >= new Date(cycle.voting_start_at) && now <= new Date(cycle.voting_end_at);
  const isVotingFuture = now < new Date(cycle.voting_start_at);
  const isVotingEnded = now > new Date(cycle.voting_end_at);
  const votesRemaining = cycle.max_votes_per_user - userVotes.length;

  // Finalization Logic
  const isFinalized = !!cycle.finalized_at;

  const winners = proposals.filter(p => 
    p.status === "selected" || p.status === "in_progress" || p.status === "completed"
  );

  const totalAllocated = winners.reduce((sum, p) => sum + (p.technical_cost || p.estimated_cost), 0);
  const remainingSurplus = cycle.total_budget_amount - totalAllocated;
  const utilizationRate = (totalAllocated / cycle.total_budget_amount) * 100;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 px-6 md:px-8">
      {/* 1. Refined Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-8 md:p-10 shadow-sm mt-6">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-50" />
        
        <div className="relative space-y-6">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Back to Registry
          </button>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                {isFinalized ? (
                  <Badge variant="outline" className="h-6 px-3 bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs font-black uppercase tracking-widest rounded-full">
                    <Trophy className="w-3 h-3 mr-1.5" /> Final Results
                  </Badge>
                ) : votingOpen ? (
                  <Badge variant="outline" className="h-6 px-3 bg-primary/10 text-primary border-primary/20 text-xs font-black uppercase tracking-widest rounded-full animate-pulse">
                    <Vote className="w-3 h-3 mr-1.5" /> Voting Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="h-6 px-3 bg-muted text-muted-foreground border-border text-xs font-black uppercase tracking-widest rounded-full">
                    {cycle.is_active ? "Operational" : "Legacy"}
                  </Badge>
                )}
                <Badge variant="outline" className="h-6 px-3 bg-muted/30 text-muted-foreground border-border text-xs font-black uppercase tracking-widest rounded-full">
                  <DollarSign className="w-3 h-3 mr-1 text-primary" />
                  Total Pool: {(cycle.total_budget_amount / 100000).toFixed(1)}L
                </Badge>
              </div>

              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground uppercase leading-tight">
                {cycle.title}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground font-medium max-w-2xl leading-relaxed">
                {cycle.description}
              </p>
            </div>

            {/* Action/Votes Remaining */}
            <div className="flex flex-col gap-4 w-full lg:w-auto">
              {submissionOpen && (
                <Button size="lg" className="w-full lg:w-auto bg-primary h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 active:scale-95 transition-all" asChild>
                  <Link href={`/citizen/participatory-budgeting/${cycle.id}/new`}>
                    <Plus className="mr-2 h-5 w-5" /> Submit Concept
                  </Link>
                </Button>
              )}
              {votingOpen && (
                <div className="bg-card border border-border p-5 rounded-2xl shadow-xs flex items-center justify-between gap-6 min-w-[220px]">
                  <div>
                    <p className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest mb-1.5 leading-none">Voting Power</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-foreground tabular-nums leading-none tracking-tighter">{votesRemaining}</span>
                      <span className="text-xs font-black text-muted-foreground/40 uppercase tracking-widest leading-none">left</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-center shrink-0">
                    <Vote className="w-6 h-6 text-primary" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {/* 2. Official Results Dashboard (Celebratory) */}
        {isFinalized && (
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 p-8 md:p-12 shadow-2xl">
              <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
              
              <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
                <div className="w-20 h-20 rounded-2xl bg-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                  <Trophy className="w-10 h-10 text-neutral-900" />
                </div>
                <div className="space-y-3 text-center md:text-left">
                  <Badge className="bg-amber-500 text-neutral-900 text-xs font-black uppercase tracking-wider rounded-full border-none px-4">
                    Fiscal Conclusion
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">The People's Mandate</h2>
                  {cycle.concluding_message && (
                    <p className="text-lg text-neutral-400 font-medium italic leading-relaxed">
                      "{cycle.concluding_message}"
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: "Capital Deployed", value: `NPR ${(totalAllocated / 100000).toFixed(1)}L`, sub: `${utilizationRate.toFixed(1)}% budget utilization`, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/5" },
                { label: "Initiatives Funded", value: winners.length, sub: `Selected from ${proposals.length} inputs`, icon: Award, color: "text-amber-500", bg: "bg-amber-500/5" },
                { label: "Surplus Reserve", value: `NPR ${(remainingSurplus / 100000).toFixed(1)}L`, sub: "Reallocated to public pool", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/5" }
              ].map((stat, i) => (
                <Card key={i} className="bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col justify-between h-40">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">{stat.label}</span>
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", stat.bg, stat.color)}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-foreground tracking-tighter tabular-nums leading-none mb-2">{stat.value}</p>
                    <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">{stat.sub}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 3. Status Guidance (If not finalized) */}
        {!isFinalized && !votingOpen && !submissionOpen && (
          <div className="bg-card border border-border rounded-2xl p-8 flex flex-col md:flex-row gap-6 items-center text-center md:text-left relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center shrink-0 relative z-10">
              <Clock className="w-8 h-8 text-primary/40" />
            </div>
            <div className="space-y-2 relative z-10 flex-1">
              <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Ecosystem Synchronization</h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-2xl">
                {isVotingFuture 
                  ? `Submission window closed. Municipal technical vetting is in progress. Public voting commences on ${format(new Date(cycle.voting_start_at), "MMMM d, yyyy")}.` 
                  : "Democratic voting period has concluded. Algorithms are currently finalizing the selection based on public mandate."}
              </p>
            </div>
            <Badge variant="outline" className="relative z-10 h-8 px-4 bg-muted text-muted-foreground text-xs font-black uppercase tracking-widest rounded-full border-border">
              Processing Phase
            </Badge>
          </div>
        )}

        {/* 4. Strategy Exploration Area */}
        <Tabs defaultValue={isFinalized ? "winners" : "all"} className="space-y-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 border-b border-border/50 pb-8">
            <TabsList className="h-12 p-1.5 bg-muted/40 border border-border rounded-xl">
              <TabsTrigger value="all" className="h-9 px-6 text-xs font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-xs">Registry</TabsTrigger>
              <TabsTrigger value="winners" className="h-9 px-6 text-xs font-black uppercase tracking-widest data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                <Trophy className="w-3.5 h-3.5 mr-2" /> 
                Winners
              </TabsTrigger>
              <TabsTrigger value="infrastructure" className="h-9 px-6 text-xs font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-xs">Urban Core</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" /> Winner
              </div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" /> Your Choice
              </div>
            </div>
          </div>

          <TabsContent value="all" className="mt-0 focus-visible:outline-none">
             <ProposalGrid 
                proposals={proposals} 
                isFinalized={isFinalized} 
                userVotes={userVotes} 
                votingOpen={votingOpen}
                handleVote={handleVote}
                votesRemaining={votesRemaining}
                votingId={voteMutation.isPending ? (voteMutation.variables as string) : null}
             />
          </TabsContent>

          <TabsContent value="winners" className="mt-0 focus-visible:outline-none">
            {winners.length > 0 ? (
              <ProposalGrid 
                proposals={winners} 
                isFinalized={isFinalized} 
                userVotes={userVotes} 
                votingOpen={false}
                handleVote={handleVote}
                votesRemaining={votesRemaining}
                votingId={voteMutation.isPending ? (voteMutation.variables as string) : null}
              />
            ) : (
              <div className="py-24 text-center bg-muted/5 border border-dashed border-border rounded-3xl">
                <Trophy className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
                <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Finalizing Mandate</h3>
                <p className="text-sm text-muted-foreground font-medium mt-2">The winners list will be populated once the validation process completes.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="infrastructure" className="mt-0 focus-visible:outline-none">
             <ProposalGrid 
                proposals={proposals.filter(p => p.category === 'road_infrastructure')} 
                isFinalized={isFinalized} 
                userVotes={userVotes} 
                votingOpen={votingOpen}
                handleVote={handleVote}
                votesRemaining={votesRemaining}
                votingId={voteMutation.isPending ? (voteMutation.variables as string) : null}
             />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// --- Sub-Component: Ultra-Clean Proposal Card Grid ---
function ProposalGrid({ 
  proposals, isFinalized, userVotes, votingOpen, handleVote, votesRemaining, votingId 
}: { 
  proposals: BudgetProposal[], isFinalized: boolean, userVotes: string[], votingOpen: boolean, handleVote: any, votesRemaining: number, votingId: string | null 
}) {
  if (proposals.length === 0) {
    return (
      <div className="py-24 text-center text-muted-foreground/40 text-xs font-black uppercase tracking-widest">
        Registry empty for this segment.
      </div>
    );
  }

  const sorted = [...proposals].sort((a, b) => {
    const isAWinner = a.status === 'selected' || a.status === 'completed';
    const isBWinner = b.status === 'selected' || b.status === 'completed';
    if (isAWinner && !isBWinner) return -1;
    if (!isAWinner && isBWinner) return 1;
    return b.vote_count - a.vote_count;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {sorted.map((proposal) => {
        const isWinner = proposal.status === 'selected' || proposal.status === 'completed';
        const hasVoted = userVotes.includes(proposal.id);
        const isNotSelected = isFinalized && !isWinner;

        return (
          <Card 
            key={proposal.id} 
            className={cn(
              "group relative flex flex-col h-full bg-card border border-border rounded-2xl overflow-hidden transition-all duration-500",
              isWinner ? "border-amber-500/50 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/20" : "hover:shadow-2xl hover:border-primary/20 hover:-translate-y-2",
              isNotSelected && "opacity-50 grayscale-[0.5]"
            )}
          >
            {/* Image & Context Section */}
            <div className="aspect-[16/10] bg-muted relative overflow-hidden">
               {proposal.cover_image_url ? (
                 <img src={proposal.cover_image_url} alt={proposal.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                   <Megaphone className="w-12 h-12 opacity-10" />
                 </div>
               )}
               
               {/* Badges Overlay */}
               <div className="absolute top-4 left-4 flex flex-col gap-2">
                 <Badge className="bg-background/80 backdrop-blur-md text-xs font-black uppercase tracking-widest text-foreground border border-border rounded-lg h-6 px-2">
                   {proposal.category.replace(/_/g, ' ')}
                 </Badge>
               </div>

               {isWinner && (
                 <div className="absolute top-4 right-4 animate-in zoom-in spin-in-12 duration-1000">
                    <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/50">
                      <Trophy className="w-5 h-5 text-neutral-900" />
                    </div>
                 </div>
               )}
               
               {hasVoted && (
                 <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[2px] flex items-center justify-center">
                   <div className="bg-emerald-500 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl flex items-center gap-2">
                     <CheckCircle2 className="w-4 h-4" /> Endorsed by You
                   </div>
                 </div>
               )}
            </div>

            <CardContent className="flex-1 p-8 space-y-6">
               <div className="space-y-3">
                 <h3 className="font-black text-xl leading-tight line-clamp-2 uppercase tracking-tight group-hover:text-primary transition-colors">
                   {proposal.title}
                 </h3>
                 <p className="text-sm text-muted-foreground/70 font-medium line-clamp-2 leading-relaxed h-8">
                   {proposal.description}
                 </p>
               </div>

               <div className="grid grid-cols-2 gap-4 pb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-tighter text-muted-foreground/40 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-primary" strokeWidth={3} /> Location
                    </p>
                    <p className="text-sm font-black text-foreground truncate">{proposal.address_text || "Pokhara"}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-xs font-black uppercase tracking-tighter text-muted-foreground/40 flex items-center gap-1.5 justify-end">
                      Estimative Cost <DollarSign className="w-3 h-3 text-emerald-500" strokeWidth={3} /> 
                    </p>
                    <p className="text-sm font-black text-foreground tabular-nums">NPR {(proposal.estimated_cost / 100000).toFixed(1)}L</p>
                  </div>
               </div>

               {/* Impact Gauge */}
               <div className="pt-2 space-y-2.5">
                  <div className="flex justify-between items-end">
                    <div className="space-y-0.5">
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">Democratic Mandate</p>
                      <p className={cn("text-xl font-black tracking-tighter tabular-nums leading-none", isWinner ? "text-amber-500" : "text-foreground")}>
                        {proposal.vote_count} <span className="text-xs font-black text-muted-foreground/40 tracking-widest uppercase ml-1">Supporters</span>
                      </p>
                    </div>
                    {isWinner && <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-black uppercase tracking-widest h-5">Project Funded</Badge>}
                  </div>
                  <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden border border-border/50">
                    <div 
                      className={cn(
                        "h-full transition-all duration-1000 rounded-full",
                        isWinner ? "bg-amber-500" : hasVoted ? "bg-emerald-500" : "bg-primary"
                      )} 
                      style={{ width: `${Math.min((proposal.vote_count / 100) * 100, 100)}%` }} 
                    />
                  </div>
               </div>
            </CardContent>

            <CardFooter className="p-8 pt-0 mt-auto">
              {!isFinalized && votingOpen && (
                <Button 
                  className={cn(
                    "w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all relative overflow-hidden shadow-offset-y-4",
                    hasVoted 
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20" 
                      : (votesRemaining <= 0)
                        ? "bg-muted text-muted-foreground cursor-not-allowed grayscale"
                        : "bg-primary hover:bg-primary/95 text-white shadow-primary/20 active:scale-95"
                  )}
                  onClick={() => handleVote(proposal.id)}
                  disabled={hasVoted || votesRemaining <= 0 || votingId === proposal.id}
                >
                  {votingId === proposal.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : hasVoted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Vote Confirmed
                    </>
                  ) : (
                    <>
                      <Vote className="w-4 h-4 mr-2" /> Support Initiative
                    </>
                  )}
                </Button>
              )}
              
              {(isFinalized || !votingOpen) && (
                <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs border-border hover:bg-muted/50 group/btn shadow-xs active:scale-95 transition-all" asChild>
                   <Link href={`/citizen/participatory-budgeting/${proposal.cycle_id}/proposals/${proposal.id}`}>
                     View Thesis & Context <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                   </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );


}
