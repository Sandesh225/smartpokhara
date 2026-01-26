"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { 
  ArrowLeft, Plus, Loader2, ThumbsUp, MapPin, 
  Tag, AlertCircle, Check, DollarSign 
} from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { Card, CardContent, CardFooter } from "../../../../../components/ui/card";
import { Badge } from "../../../../../components/ui/badge";
import { Progress } from "../../../../../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { 
  pbService, 
  type BudgetCycle, 
  type BudgetProposal 
} from "../../../../../lib/supabase/queries/participatory-budgeting";

export default function CycleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const cycleId = params.cycleId as string;

  const [cycle, setCycle] = useState<BudgetCycle | null>(null);
  const [proposals, setProposals] = useState<BudgetProposal[]>([]);
  const [userVotes, setUserVotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [cycleData, proposalsData, votesData] = await Promise.all([
          pbService.getCycleById(cycleId),
          pbService.getProposals(cycleId),
          pbService.getUserVotes(cycleId)
        ]);
        
        setCycle(cycleData);
        setProposals(proposalsData);
        setUserVotes(votesData);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [cycleId]);

  const handleVote = async (proposalId: string) => {
    if (!cycle) return;
    
    // Optimistic check
    if (userVotes.length >= cycle.max_votes_per_user) {
      toast.error(`You have used all ${cycle.max_votes_per_user} votes for this cycle.`);
      return;
    }

    setVotingId(proposalId);
    try {
      const response = await pbService.voteForProposal(proposalId);
      if (response.success) {
        toast.success(response.message);
        setUserVotes([...userVotes, proposalId]);
        
        // Update local state vote count
        setProposals(current => 
          current.map(p => 
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

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!cycle) return <div>Cycle not found</div>;

  const now = new Date();
  const submissionOpen = now >= new Date(cycle.submission_start_at) && now <= new Date(cycle.submission_end_at);
  const votingOpen = now >= new Date(cycle.voting_start_at) && now <= new Date(cycle.voting_end_at);
  const isVotingFuture = now < new Date(cycle.voting_start_at);
  const isVotingEnded = now > new Date(cycle.voting_end_at);
  
  const votesRemaining = cycle.max_votes_per_user - userVotes.length;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col gap-6 mb-8">
        <Button variant="ghost" className="w-fit pl-0 hover:pl-2 transition-all" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cycles
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2">{cycle.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                <DollarSign className="w-4 h-4" /> Budget: NPR {cycle.total_budget_amount.toLocaleString()}
              </span>
              
              {/* Conditional Vote Counter: Only show if voting is open */}
              {votingOpen ? (
                <span className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-md text-primary font-medium">
                   Votes Remaining: <span className="font-bold">{votesRemaining} / {cycle.max_votes_per_user}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                   Status: <span className="font-medium text-foreground">{isVotingFuture ? "Voting Starts Soon" : (isVotingEnded ? "Voting Ended" : "Closed")}</span>
                </span>
              )}
            </div>
          </div>

          {submissionOpen && (
            <Button asChild className="shrink-0">
              <Link href={`/citizen/participatory-budgeting/${cycle.id}/new`}>
                <Plus className="mr-2 h-4 w-4" /> Submit Proposal
              </Link>
            </Button>
          )}
        </div>

        {/* Status Alerts */}
        {!votingOpen && !submissionOpen && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">
              {isVotingEnded 
                ? "This voting cycle has ended. Results are being calculated." 
                : "This cycle is currently in review. Voting is not open yet."}
            </p>
          </div>
        )}
        
        {votingOpen && (
          <div className="bg-primary/5 border border-primary/20 text-primary px-4 py-3 rounded-lg flex items-center gap-3">
            <ThumbsUp className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">
              Voting is open! Review the proposals below and support your favorites.
            </p>
          </div>
        )}
      </div>

      {/* Proposals Grid */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Proposals</TabsTrigger>
          <TabsTrigger value="road_infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="education_culture">Education</TabsTrigger>
          <TabsTrigger value="parks_environment">Environment</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proposals.map((proposal) => {
              const hasVoted = userVotes.includes(proposal.id);
              
              return (
                <Card key={proposal.id} className="flex flex-col overflow-hidden h-full">
                  <div className="aspect-video bg-muted relative">
                    {proposal.cover_image_url ? (
                      <img 
                        src={proposal.cover_image_url} 
                        alt={proposal.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/50">
                        <div className="flex flex-col items-center gap-2">
                          <Tag className="w-8 h-8 opacity-20" />
                          <span className="text-xs">No Image</span>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-white/90 text-black backdrop-blur-sm shadow-sm capitalize">
                        {proposal.category.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="flex-1 pt-6">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1" title={proposal.title}>{proposal.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4" title={proposal.description}>
                      {proposal.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-xs text-muted-foreground gap-2">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{proposal.address_text || "Pokhara"}</span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground gap-2">
                        <DollarSign className="w-3 h-3 shrink-0" />
                        <span>Est. NPR {proposal.estimated_cost.toLocaleString()}</span>
                      </div>
                      
                      <div className="space-y-1 pt-2">
                        <div className="flex justify-between text-xs font-medium">
                          <span>{proposal.vote_count} Votes</span>
                        </div>
                        <Progress value={Math.min((proposal.vote_count / 100) * 100, 100)} className="h-1.5" />
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 pb-6">
                    {hasVoted ? (
                      <Button variant="secondary" className="w-full gap-2 text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 cursor-default">
                        <Check className="w-4 h-4" /> Voted
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleVote(proposal.id)}
                        disabled={!votingOpen || votesRemaining === 0 || votingId === proposal.id}
                        className="w-full gap-2"
                      >
                        {votingId === proposal.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ThumbsUp className="w-4 h-4" />
                        )}
                        {votingOpen ? "Vote" : "Voting Closed"}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
          
          {proposals.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/10">
              <Tag className="w-10 h-10 mb-3 opacity-20" />
              <p>No proposals found for this cycle yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}