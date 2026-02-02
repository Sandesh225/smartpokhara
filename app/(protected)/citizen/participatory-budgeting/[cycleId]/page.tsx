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
import {
  pbService,
  type BudgetCycle,
  type BudgetProposal,
} from "@/lib/supabase/queries/participatory-budgeting";

export default function CycleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const cycleId = params.cycleId as string;

  // --- State Management ---
  const [cycle, setCycle] = useState<BudgetCycle | null>(null);
  const [proposals, setProposals] = useState<BudgetProposal[]>([]);
  const [userVotes, setUserVotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState<string | null>(null);

  // --- Data Fetching ---
  useEffect(() => {
    async function fetchData() {
      try {
        const [cycleData, proposalsData, votesData] = await Promise.all([
          pbService.getCycleById(cycleId),
          pbService.getProposals(cycleId, null), // Fetch ALL status types
          pbService.getUserVotes(cycleId),
        ]);

        setCycle(cycleData);
        setProposals(proposalsData);
        setUserVotes(votesData);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load cycle data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [cycleId]);

  // --- Voting Logic ---
  const handleVote = async (proposalId: string) => {
    if (!cycle) return;

    if (userVotes.length >= cycle.max_votes_per_user) {
      toast.error(`You have used all ${cycle.max_votes_per_user} votes for this cycle.`);
      return;
    }

    setVotingId(proposalId);
    try {
      const response = await pbService.voteForProposal(proposalId);
      if (response.success) {
        toast.success("Vote cast successfully! 🎉");
        setUserVotes([...userVotes, proposalId]);
        setProposals((current) =>
          current.map((p) =>
            p.id === proposalId ? { ...p, vote_count: p.vote_count + 1 } : p
          )
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to cast vote");
    } finally {
      setVotingId(null);
    }
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-3xl animate-pulse" />
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
    <div className="min-h-screen bg-background pb-20">
      {/* 1. Hero / Header Section */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b border-primary/10 pb-8 pt-8 px-4">
        <div className="container max-w-7xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6 pl-0 hover:pl-2 transition-all text-muted-foreground hover:text-foreground"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Cycles
          </Button>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-3 flex-wrap">
                {isFinalized ? (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-3 py-1 text-sm shadow-md animate-in zoom-in">
                    <Trophy className="w-3.5 h-3.5 mr-1.5" /> Winners Announced
                  </Badge>
                ) : votingOpen ? (
                  <Badge className="bg-blue-600 text-white border-0 px-3 py-1 text-sm animate-pulse">
                    <Vote className="w-3.5 h-3.5 mr-1.5" /> Voting Live
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="px-3 py-1 text-sm">
                    {cycle.is_active ? "Active Cycle" : "Archived"}
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded-full border">
                  <DollarSign className="w-3.5 h-3.5" />
                  Fiscal Pool: NPR <span className="font-mono font-bold text-foreground">{(cycle.total_budget_amount / 100000).toFixed(1)} Lakhs</span>
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                {cycle.title}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {cycle.description}
              </p>
            </div>

            {/* Action Area */}
            <div className="flex flex-col gap-3 w-full lg:w-auto">
              {submissionOpen && (
                <Button size="lg" className="w-full lg:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg" asChild>
                  <Link href={`/citizen/participatory-budgeting/${cycle.id}/new`}>
                    <Plus className="mr-2 h-5 w-5" /> Submit Proposal
                  </Link>
                </Button>
              )}
              {votingOpen && (
                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-100 dark:border-blue-900">
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Your Voice</p>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-black text-blue-700 dark:text-blue-300">
                      {votesRemaining}
                    </div>
                    <span className="text-sm font-medium text-blue-600/80 dark:text-blue-400/80">votes remaining</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-8 space-y-10">
        
        {/* 2. Official Announcement (If Finalized) */}
        {isFinalized && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-2xl p-8 md:p-10 mb-8">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-20">
                  <Sparkles className="w-64 h-64 text-white rotate-12" />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                  <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl shrink-0">
                    <Award className="w-12 h-12 text-white" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-3xl font-black tracking-tight">The Results are In!</h2>
                    {cycle.concluding_message && (
                      <p className="text-lg md:text-xl text-amber-50 leading-relaxed font-medium max-w-4xl border-l-4 border-white/30 pl-4">
                        "{cycle.concluding_message}"
                      </p>
                    )}
                  </div>
                </div>
             </div>

             {/* Transparency Dashboard */}
             <div className="grid md:grid-cols-3 gap-6 mb-12">
               <Card className="border-l-4 border-l-green-500 bg-card shadow-md hover:shadow-lg transition-all">
                 <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Total Allocated</span>
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-3xl font-black text-foreground">NPR {(totalAllocated / 100000).toFixed(1)}L</p>
                    <Progress value={utilizationRate} className="h-2 mt-4 bg-green-100" />
                    <p className="text-xs text-muted-foreground mt-2">{utilizationRate.toFixed(1)}% of budget utilized</p>
                 </CardContent>
               </Card>

               <Card className="border-l-4 border-l-amber-500 bg-card shadow-md hover:shadow-lg transition-all">
                 <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Projects Funded</span>
                      <Trophy className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-3xl font-black text-foreground">{winners.length}</p>
                    <p className="text-sm text-muted-foreground mt-1">Selected from {proposals.length} proposals</p>
                 </CardContent>
               </Card>

               <Card className="border-l-4 border-l-slate-400 bg-card shadow-md hover:shadow-lg transition-all">
                 <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Surplus Returned</span>
                      <TrendingUp className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-3xl font-black text-foreground">NPR {(remainingSurplus / 100000).toFixed(2)}L</p>
                    <p className="text-sm text-muted-foreground mt-1">Available for next cycle</p>
                 </CardContent>
               </Card>
             </div>
          </div>
        )}

        {/* 3. Status Alerts (If not finalized) */}
        {!isFinalized && !votingOpen && !submissionOpen && (
           <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 flex gap-4 items-start">
             <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
             <div>
               <h3 className="font-bold text-yellow-800 dark:text-yellow-300">Cycle Status: In Review</h3>
               <p className="text-yellow-700 dark:text-yellow-400 mt-1">
                 {isVotingFuture 
                   ? `Submissions are closed. Technical vetting is in progress. Voting starts on ${format(new Date(cycle.voting_start_at), "MMM d")}.` 
                   : "Voting has ended. The municipality is currently calculating the results and will announce winners soon."}
               </p>
             </div>
           </div>
        )}

        {/* 4. Proposals Tabs & Grid */}
        <Tabs defaultValue={isFinalized ? "winners" : "all"} className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
             <TabsList className="h-12 p-1 bg-muted/50 rounded-xl">
                <TabsTrigger value="all" className="rounded-lg px-6">All Proposals</TabsTrigger>
                <TabsTrigger value="winners" className="rounded-lg px-6 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 dark:data-[state=active]:bg-amber-900/50 dark:data-[state=active]:text-amber-100">
                  <Trophy className="w-3.5 h-3.5 mr-2" /> 
                  Winners {isFinalized && `(${winners.length})`}
                </TabsTrigger>
                <TabsTrigger value="infrastructure" className="rounded-lg px-6">Infrastructure</TabsTrigger>
             </TabsList>
             
             {/* Legend */}
             <div className="flex items-center gap-4 text-xs text-muted-foreground">
               <div className="flex items-center gap-1.5">
                 <div className="w-3 h-3 rounded-full bg-amber-500" /> Winner
               </div>
               <div className="flex items-center gap-1.5">
                 <div className="w-3 h-3 rounded-full bg-green-500" /> Your Vote
               </div>
             </div>
          </div>

          <TabsContent value="all" className="space-y-8">
             <ProposalGrid 
                proposals={proposals} 
                isFinalized={isFinalized} 
                userVotes={userVotes} 
                votingOpen={votingOpen}
                handleVote={handleVote}
                votesRemaining={votesRemaining}
                votingId={votingId}
             />
          </TabsContent>

          <TabsContent value="winners" className="space-y-8">
            {winners.length > 0 ? (
              <ProposalGrid 
                proposals={winners} 
                isFinalized={isFinalized} 
                userVotes={userVotes} 
                votingOpen={false} // Voting always closed for winners tab visual
                handleVote={handleVote}
                votesRemaining={votesRemaining}
                votingId={votingId}
              />
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
                <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-bold text-lg">Winners Not Yet Announced</h3>
                <p className="text-muted-foreground">Check back after the voting period concludes.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="infrastructure" className="space-y-8">
             <ProposalGrid 
                proposals={proposals.filter(p => p.category === 'road_infrastructure')} 
                isFinalized={isFinalized} 
                userVotes={userVotes} 
                votingOpen={votingOpen}
                handleVote={handleVote}
                votesRemaining={votesRemaining}
                votingId={votingId}
             />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}

// --- Sub-Component: Proposal Grid ---
function ProposalGrid({ 
  proposals, isFinalized, userVotes, votingOpen, handleVote, votesRemaining, votingId 
}: { 
  proposals: BudgetProposal[], isFinalized: boolean, userVotes: string[], votingOpen: boolean, handleVote: any, votesRemaining: number, votingId: string | null 
}) {
  if (proposals.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No proposals found in this category.
      </div>
    );
  }

  // Sorting Logic: Winners first, then by votes
  const sorted = [...proposals].sort((a, b) => {
    const isAWinner = a.status === 'selected';
    const isBWinner = b.status === 'selected';
    if (isAWinner && !isBWinner) return -1;
    if (!isAWinner && isBWinner) return 1;
    return b.vote_count - a.vote_count;
  });

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sorted.map((proposal, idx) => {
        const isWinner = proposal.status === 'selected' || proposal.status === 'completed';
        const hasVoted = userVotes.includes(proposal.id);
        const isNotSelected = isFinalized && !isWinner;

        return (
          <Card 
            key={proposal.id} 
            className={`
              flex flex-col h-full overflow-hidden transition-all duration-300 group
              ${isWinner ? 'border-amber-400 border-2 shadow-xl scale-[1.02] z-10' : 'hover:shadow-lg border-muted'}
              ${isNotSelected ? 'opacity-70 grayscale-[0.5] hover:opacity-100 hover:grayscale-0' : ''}
            `}
          >
            {/* Winner Badge Banner */}
            {isWinner && (
              <div className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest py-1.5 text-center flex items-center justify-center gap-1.5 shadow-sm">
                <Trophy className="w-3 h-3" /> Community Choice #{idx + 1}
              </div>
            )}

            {/* Image Section */}
            <div className="aspect-video bg-muted relative overflow-hidden">
               {proposal.cover_image_url ? (
                 <img src={proposal.cover_image_url} alt={proposal.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 bg-muted/50">
                   <Megaphone className="w-10 h-10" />
                 </div>
               )}
               <div className="absolute top-3 right-3">
                 <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm shadow-sm capitalize">
                   {proposal.category.replace(/_/g, ' ')}
                 </Badge>
               </div>
            </div>

            <CardContent className="flex-1 pt-5 space-y-4">
               <div>
                 <h3 className="font-bold text-lg leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                   {proposal.title}
                 </h3>
                 <p className="text-sm text-muted-foreground line-clamp-2">
                   {proposal.description}
                 </p>
               </div>

               <Separator className="bg-border/50" />

               <div className="grid grid-cols-2 gap-4 text-xs">
                 <div className="space-y-1">
                   <span className="text-muted-foreground font-semibold flex items-center gap-1">
                     <MapPin className="w-3 h-3" /> Location
                   </span>
                   <p className="font-medium truncate">{proposal.address_text || "Pokhara"}</p>
                 </div>
                 <div className="space-y-1 text-right">
                   <span className="text-muted-foreground font-semibold flex items-center justify-end gap-1">
                     <DollarSign className="w-3 h-3" /> Cost
                   </span>
                   <p className={`font-mono font-bold ${isWinner ? "text-amber-600" : ""}`}>
                      NPR {(proposal.technical_cost || proposal.estimated_cost).toLocaleString()}
                   </p>
                 </div>
               </div>

               {/* Vote Progress Bar */}
               <div className="space-y-1.5 pt-1">
                 <div className="flex justify-between text-xs font-semibold">
                   <span className={isWinner ? "text-amber-600" : "text-foreground"}>
                     {proposal.vote_count} Votes
                   </span>
                   {isWinner && <span className="text-amber-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Funded</span>}
                 </div>
                 <Progress 
                   value={Math.min((proposal.vote_count / 100) * 100, 100)} 
                   className={`h-2 ${isWinner ? "bg-amber-100 [&>div]:bg-amber-500" : ""}`} 
                 />
               </div>
            </CardContent>

            <CardFooter className="pt-0 pb-5">
              {isWinner ? (
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md" asChild>
                  <Link href={`/citizen/implementation/${proposal.id}`}>
                    <Target className="w-4 h-4 mr-2" /> Track Implementation
                  </Link>
                </Button>
              ) : hasVoted ? (
                <Button variant="secondary" className="w-full bg-green-100 text-green-700 hover:bg-green-200 border border-green-200 font-semibold cursor-default">
                  <Check className="w-4 h-4 mr-2" /> You Voted For This
                </Button>
              ) : votingOpen && !isFinalized ? (
                <Button 
                  onClick={() => handleVote(proposal.id)}
                  disabled={votesRemaining === 0 || votingId === proposal.id}
                  className="w-full"
                >
                  {votingId === proposal.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ThumbsUp className="w-4 h-4 mr-2" />}
                  Vote Project
                </Button>
              ) : (
                <Button variant="outline" disabled className="w-full opacity-70">
                  {isNotSelected ? "Not Selected" : "Voting Closed"}
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}