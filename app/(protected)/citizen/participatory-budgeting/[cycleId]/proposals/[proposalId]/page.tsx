"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { 
  ArrowLeft, MapPin, Calendar, User, Building, 
  ThumbsUp, DollarSign, CheckCircle2, XCircle, 
  AlertTriangle, Loader2, FileText, Megaphone,
  TrendingUp, Award, Trophy, Clock
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Domain Features
import { 
  usePBProposal, 
  usePBVotes,
  usePBMutations,
  useBudgetCycle,
  type BudgetProposal
} from "@/features/participatory-budgeting";

export default function CitizenProposalDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.proposalId as string;
  const cycleId = params.cycleId as string;

  // Domain Hooks
  const { data: proposal, isLoading: proposalLoading } = usePBProposal(proposalId);
  const { data: cycle, isLoading: cycleLoading } = useBudgetCycle(cycleId);
  const { data: userVotes = [] } = usePBVotes(cycleId);
  const { vote: voteMutation } = usePBMutations();

  const loading = proposalLoading || cycleLoading;

  // Voting Logic
  const handleVote = async () => {
    if (!cycle || !proposal) return;
    if (userVotes.length >= cycle.max_votes_per_user) return;
    voteMutation.mutate(proposal.id);
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
          <Loader2 className="w-16 h-16 animate-spin text-primary relative z-10" />
        </div>
        <p className="text-sm font-black uppercase tracking-wider text-muted-foreground animate-pulse">Synchronizing Intelligence</p>
      </div>
    );
  }

  if (!proposal || !cycle) {
    return (
      <div className="container mx-auto py-20 max-w-2xl px-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-8">
           <AlertTriangle className="w-10 h-10 text-muted-foreground/40" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Thesis Not Identified</h2>
        <p className="text-muted-foreground font-medium mb-10">The requested proposal reference could not be located in the provincial registry.</p>
        <Button onClick={() => router.back()} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs">
           Return to Registry
        </Button>
      </div>
    );
  }

  const hasVoted = userVotes.includes(proposal.id);
  const votesRemaining = cycle.max_votes_per_user - userVotes.length;
  const now = new Date();
  const votingOpen = now >= new Date(cycle.voting_start_at) && now <= new Date(cycle.voting_end_at);
  const isWinner = proposal.status === 'selected' || proposal.status === 'completed';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 px-6 md:px-8">
      {/* 1. Dynamic Header */}
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-8 md:p-10 shadow-sm mt-6">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-50" />
        
        <div className="relative space-y-6">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Internal Registry
          </button>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="h-6 px-3 bg-primary/10 text-primary border-primary/20 text-xs font-black uppercase tracking-widest rounded-full">
                  {proposal.category.replace(/_/g, " ")}
                </Badge>
                {isWinner && (
                  <Badge className="h-6 px-3 bg-amber-500 text-neutral-900 border-none text-xs font-black uppercase tracking-widest rounded-full shadow-lg shadow-amber-500/20">
                    <Trophy className="w-3 h-3 mr-1.5" /> Selected Mandate
                  </Badge>
                )}
                <Badge variant="outline" className="h-6 px-3 bg-muted/30 text-muted-foreground border-border text-xs font-black uppercase tracking-widest rounded-full">
                  <User className="w-3 h-3 mr-1.5" /> {proposal.author?.full_name || "Civic Contributor"}
                </Badge>
              </div>

              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground uppercase leading-tight">
                {proposal.title}
              </h1>
              
              <div className="flex items-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                   <Calendar className="w-4 h-4 text-primary" />
                   <span className="text-xs font-black uppercase tracking-widest">Logged {format(new Date(proposal.created_at), "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2">
                   <MapPin className="w-4 h-4 text-primary" strokeWidth={3} />
                   <span className="text-xs font-black uppercase tracking-widest">{proposal.address_text || "Ward Context Available"}</span>
                </div>
              </div>
            </div>

            {/* Voting Action Area */}
            {votingOpen && (
              <div className="w-full lg:w-auto">
                <Button 
                  size="lg"
                  className={cn(
                    "w-full h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl transition-all active:scale-95 group relative overflow-hidden",
                    hasVoted 
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20" 
                      : (votesRemaining <= 0)
                        ? "bg-muted text-muted-foreground cursor-not-allowed grayscale"
                        : "bg-primary hover:bg-primary/95 text-white shadow-primary/20"
                  )}
                  onClick={handleVote}
                  disabled={hasVoted || votesRemaining <= 0 || voteMutation.isPending}
                >
                  {voteMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : hasVoted ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-3" /> Vote Confirmed
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="w-5 h-5 mr-3" /> Endorse Initiative
                    </>
                  )}
                </Button>
                {!hasVoted && votesRemaining > 0 && (
                   <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40 text-center mt-3">
                     {votesRemaining} allocation units remaining
                   </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-3xl border border-border bg-card shadow-xs overflow-hidden">
            {proposal.cover_image_url && (
              <div className="aspect-video w-full overflow-hidden border-b border-border">
                <img 
                  src={proposal.cover_image_url} 
                  alt="Thesis visual reference" 
                  className="object-cover w-full h-full hover:scale-105 transition-transform duration-1000"
                />
              </div>
            )}
            <CardContent className="p-10 space-y-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-primary" strokeWidth={3} />
                   </div>
                   <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Theoretical Framework</h3>
                </div>
                <p className="text-base text-muted-foreground font-medium leading-relaxed whitespace-pre-wrap">
                  {proposal.description}
                </p>
              </div>

              <Separator className="opacity-50" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-primary" strokeWidth={3} />
                     </div>
                     <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Spatial Deployment</h3>
                  </div>
                  <div className="p-6 bg-muted/20 border border-border rounded-2xl space-y-3">
                    <div className="space-y-1">
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">Registered Location</p>
                      <p className="text-sm font-black text-foreground">{proposal.address_text || "Community Wide Application"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">Responsible Jurisdiction</p>
                      <p className="text-sm font-black text-foreground">Pokhara Ward Administration</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center">
                        <Building className="w-4 h-4 text-primary" strokeWidth={3} />
                     </div>
                     <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Technical Sector</h3>
                  </div>
                  <div className="p-6 bg-muted/20 border border-border rounded-2xl space-y-3">
                    <div className="space-y-1">
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">Municipal Department</p>
                      <p className="text-sm font-black text-foreground">{proposal.department?.name || "Governance Registry"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">Category Reference</p>
                      <p className="text-sm font-black text-foreground capitalize">{proposal.category.replace(/_/g, " ")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Context */}
        <div className="space-y-8">
          {/* Fiscal Metrics */}
          <Card className="rounded-3xl border border-border bg-card shadow-sm p-8 space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                   <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">Fiscal Projection</span>
                   <DollarSign className="w-4 h-4 text-emerald-500" strokeWidth={3} />
                </div>
                <p className="text-3xl font-black text-foreground tracking-tighter tabular-nums leading-none">
                  NPR {(proposal.estimated_cost / 100000).toFixed(1)}L
                </p>
                <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest italic">Civic Estimate Accuracy Range: ±15%</p>
              </div>

              <Separator className="opacity-50" />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                   <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">Democratic Mandate</span>
                   <TrendingUp className="w-4 h-4 text-primary" strokeWidth={3} />
                </div>
                <p className="text-3xl font-black text-foreground tracking-tighter tabular-nums leading-none">
                  {proposal.vote_count || 0}
                </p>
                <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest uppercase">Verified community endorsements</p>
              </div>
            </div>

            {isWinner ? (
              <div className="p-6 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/20 text-neutral-900 space-y-2">
                 <Trophy className="w-6 h-6 mb-2" />
                 <h4 className="font-black uppercase tracking-widest text-xs">Selection Status</h4>
                 <p className="text-xs font-bold uppercase leading-relaxed">This initiative has been selected for municipal funding and implementation.</p>
              </div>
            ) : (
              <div className="p-6 bg-muted/40 rounded-2xl border border-border text-muted-foreground space-y-2">
                 <Clock className="w-6 h-6 mb-2 opacity-40" />
                 <h4 className="font-black uppercase tracking-widest text-xs">Verification Pulse</h4>
                 <p className="text-xs font-bold uppercase leading-relaxed">Currently undergoing administrative vetting and public verification phase.</p>
              </div>
            )}
          </Card>

          {/* Verification Badge */}
          <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10 flex items-center gap-6 group">
             <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6 text-primary" strokeWidth={3} />
             </div>
             <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Verified Submission</h4>
                <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">Sovereign Civic Identity Confirmed</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
