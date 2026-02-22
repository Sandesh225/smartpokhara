"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { 
  Loader2, Search, Inbox, CheckCircle2, XCircle, 
  MapPin, DollarSign, Calendar, Building, Briefcase,
  Filter, TrendingUp, Clock, Eye, Sparkles, ArrowRight,
  FileText, AlertCircle, Users
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { pbApi } from "@/features/participatory-budgeting/api";
import { type BudgetCycle, type BudgetProposal } from "@/features/participatory-budgeting/types";

export default function SupervisorProposalsPage() {
  const supabase = createClient();
  const [cycles, setCycles] = useState<BudgetCycle[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<string>("");
  const [proposals, setProposals] = useState<BudgetProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    pbApi.getActiveCycles(supabase).then(data => {
      setCycles(data);
      if (data.length > 0) setSelectedCycle(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedCycle) return;
    setLoading(true);
    // Pass NULL to fetch ALL proposals visible via RLS
    // Note: features api getProposals takes (client, cycleId, statusFilter)
    pbApi.getProposals(supabase, selectedCycle, null)
      .then(setProposals)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCycle]);

  // Derived State for Tabs
  const pendingProposals = proposals.filter(p => p.status === 'submitted' || p.status === 'under_review');
  const processedProposals = proposals.filter(p => p.status !== 'submitted' && p.status !== 'under_review');
  
  // Derived state for header and stats
  const activeCycle = cycles.find(c => c.id === selectedCycle);

  const stats = {
    pending: pendingProposals.length,
    approved: proposals.filter(p => p.status === 'approved_for_voting').length,
    rejected: proposals.filter(p => p.status === 'rejected').length,
  };

  // Filtering
  const filterProposals = (list: BudgetProposal[]) => {
    if (!searchTerm) return list;
    return list.filter(p => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.author?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 px-6 md:px-8">
      {/* 1. Ultra-Clean Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-8 md:p-12 shadow-sm mt-6">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-30" />
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
              <Inbox className="w-3.5 h-3.5" /> Technical Verification
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground uppercase leading-tight">
              Vetting <span className="text-primary">Console</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground font-medium max-w-2xl leading-relaxed">
              Synthesize and validate civic proposals for <span className="text-foreground font-bold">{activeCycle ? activeCycle.title : "the current cycle"}</span>. Your review determines fiscal eligibility.
            </p>
          </div>
          
          <div className="flex flex-col gap-3 shrink-0 items-end">
            <span className="text-xs font-black uppercase text-muted-foreground/40 tracking-widest px-1">Active Cycle Registry</span>
            <div className="px-6 py-2 rounded-2xl bg-muted/30 border border-border/50 text-center font-black text-xs text-foreground uppercase tracking-widest">
              {activeCycle ? activeCycle.title : "None Selected"}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Pending Review", value: stats.pending, icon: Clock, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Validated", value: stats.approved, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-rose-500", bg: "bg-rose-500/10" }
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-xs flex flex-col justify-between h-32">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">{stat.label}</span>
              <div className={cn("p-1.5 rounded-lg border border-current/20", stat.color, stat.bg)}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-black text-foreground tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* 3. Main Content Area */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            <Input 
              placeholder="Search proposals by title or author..." 
              className="pl-11 pr-4 h-12 bg-card border-border/50 focus:border-primary transition-all text-sm rounded-xl font-medium shadow-xs w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-xs border-border/50 shadow-xs hover:bg-muted"
          >
            <Filter className="w-3.5 h-3.5 mr-2 opacity-50" />
            <span>Filters</span>
          </Button>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <div className="flex items-center justify-between mb-8 border-b border-border pb-1">
            <TabsList className="bg-transparent h-auto p-0 gap-8">
              <TabsTrigger 
                value="pending"
                className="relative px-0 py-3 bg-transparent text-muted-foreground hover:text-foreground data-[state=active]:text-primary font-black uppercase tracking-widest text-xs rounded-none data-[state=active]:shadow-none transition-all after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform"
              >
                Pending Review <span className="ml-2 px-1.5 py-0.5 bg-muted rounded-full text-xs text-muted-foreground/60">{pendingProposals.length}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="processed"
                className="relative px-0 py-3 bg-transparent text-muted-foreground hover:text-foreground data-[state=active]:text-primary font-black uppercase tracking-widest text-xs rounded-none data-[state=active]:shadow-none transition-all after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform"
              >
                Processed <span className="ml-2 px-1.5 py-0.5 bg-muted rounded-full text-xs text-muted-foreground/60">{processedProposals.length}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Synchronizing proposals...</p>
            </div>
          ) : (
            <>
              <TabsContent value="pending" className="mt-0 focus-visible:outline-none space-y-4">
                {pendingProposals.length === 0 ? (
                  <div className="py-20 text-center bg-muted/5 border border-dashed rounded-xl flex flex-col items-center justify-center gap-4">
                    <div className="p-4 bg-muted/50 rounded-2xl">
                      <Inbox className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">All Proposals Vetted</h3>
                      <p className="text-xs text-muted-foreground mt-1">Excellent work. The inbox is currently empty.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filterProposals(pendingProposals).length === 0 ? (
                      <div className="py-12 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">No matching results</div>
                    ) : (
                      filterProposals(pendingProposals).map(p => <SupervisorProposalCard key={p.id} proposal={p} />)
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="processed" className="mt-0 focus-visible:outline-none space-y-4">
                {processedProposals.length === 0 ? (
                  <div className="py-20 text-center bg-muted/5 border border-dashed rounded-xl">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">History is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filterProposals(processedProposals).length === 0 ? (
                      <div className="py-12 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">No matching results</div>
                    ) : (
                      filterProposals(processedProposals).map(p => <SupervisorProposalCard key={p.id} proposal={p} />)
                    )}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}

// --- Sub-component: Ultra-Clean Supervisor Card ---
function SupervisorProposalCard({ proposal }: { proposal: BudgetProposal }) {
  const statusConfig = {
    submitted: { color: "bg-purple-100 text-purple-700 border-purple-200/50", label: "Vetting Required", icon: Clock },
    under_review: { color: "bg-blue-100 text-blue-700 border-blue-200/50", label: "Under Review", icon: Eye },
    approved_for_voting: { color: "bg-emerald-100 text-emerald-700 border-emerald-200/50", label: "Validated", icon: CheckCircle2 },
    rejected: { color: "bg-rose-100 text-rose-700 border-rose-200/50", label: "Returned", icon: XCircle }
  };

  const config = statusConfig[proposal.status as keyof typeof statusConfig] || { 
    color: "bg-muted text-muted-foreground border-border", 
    label: proposal.status.replace(/_/g, ' '), 
    icon: FileText 
  };

  return (
    <div className="group flex flex-col md:flex-row bg-card border border-border rounded-xl overflow-hidden shadow-xs hover:border-primary/20 transition-all">
      <div className="p-6 md:p-8 flex-1 space-y-6">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/5 text-primary text-xs font-black uppercase tracking-widest border border-primary/10">
                {proposal.category.replace(/_/g, ' ')}
              </span>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest tubular-nums">
                {format(new Date(proposal.created_at), "MMM d, yyyy")}
              </span>
            </div>
            <h2 className="text-lg font-black text-foreground tracking-tight uppercase group-hover:text-primary transition-colors line-clamp-1">
              {proposal.title}
            </h2>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {proposal.description}
            </p>
          </div>
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-widest border shrink-0",
            config.color
          )}>
            <config.icon className="w-2.5 h-2.5" />
            {config.label}
          </span>
        </div>

        <div className="flex items-center gap-6 text-xs flex-wrap pt-2">
          <div className="flex items-center gap-2 text-muted-foreground/60 font-bold uppercase tracking-widest">
            <MapPin className="w-3 h-3 text-primary" />
            <span className="max-w-[120px] truncate">{proposal.address_text || "Pokhara"}</span>
          </div>
          
          <div className="flex items-center gap-2 text-emerald-600 font-black uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
            <DollarSign className="w-3 h-3" />
            <span>NPR {proposal.estimated_cost.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground/60 font-bold uppercase tracking-widest">
            <Users className="w-3 h-3" />
            <span>{proposal.author?.full_name}</span>
          </div>
        </div>
      </div>

      <div className="mt-auto md:mt-0 flex md:flex-col md:w-[220px] md:border-l border-t md:border-t-0 border-border bg-muted/10">
        <div className="hidden md:flex flex-col p-6 space-y-4 flex-1">
          {proposal.department && (
            <div className="space-y-1.5">
              <p className="text-xs font-black uppercase text-muted-foreground/40 tracking-widest">Assigned Dept</p>
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Building className="w-3 h-3 opacity-30" />
                {proposal.department.name}
              </div>
            </div>
          )}
        </div>
        <Button asChild className="flex-1 md:flex-none h-12 md:h-14 rounded-none bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-widest shadow-none">
          <Link href={`/supervisor/participatory-budgeting/${proposal.id}`}>
            Review Account <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
