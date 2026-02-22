"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { 
  Plus, Calendar, DollarSign, Loader2, TrendingUp, 
  Users, CheckCircle2, Clock, BarChart3, Settings,
  Eye, AlertCircle, Sparkles
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
// Domain Features
import { 
  useBudgetCycles, 
  type BudgetCycle 
} from "@/features/participatory-budgeting";

export default function AdminBudgetingPage() {
  const { data: cycles = [], isLoading: loading } = useBudgetCycles();

  const activeCycles = cycles.filter(c => c.is_active);
  const archivedCycles = cycles.filter(c => !c.is_active);
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 px-6 md:px-8">
      {/* 1. Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-8 md:p-10 shadow-sm mt-6 text-center">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-50" />
        
        <div className="relative space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
            Resource Governance
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground uppercase leading-tight">
            Fiscal <span className="text-primary">Ecosystem</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
            Architecting democracy through multi-phase budget cycles and citizen-led project selection.
          </p>

          <div className="pt-6">
            <Button 
              asChild 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest h-14 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all"
            >
              <Link href="/admin/participatory-budgeting/create">
                <Plus className="mr-2 h-5 w-5" /> 
                Initialize New Cycle
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Dashboard */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Gross Cycles", value: cycles.length, icon: BarChart3, color: "text-blue-500", bg: "bg-blue-500/5" },
            { label: "Active Phases", value: activeCycles.length, icon: Sparkles, color: "text-emerald-500", bg: "bg-emerald-500/5" },
            { 
              label: "Cumulative Pool", 
              value: `${(cycles.reduce((sum, c) => sum + (c.total_budget_amount || 0), 0) / 10000000).toFixed(1)}Cr`, 
              icon: DollarSign, color: "text-purple-500", bg: "bg-purple-500/5" 
            },
            { label: "Finalized", value: archivedCycles.length, icon: CheckCircle2, color: "text-orange-500", bg: "bg-orange-500/5" }
          ].map((stat, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-6 shadow-xs flex flex-col justify-between h-36 group hover:border-primary/20 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">{stat.label}</span>
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors", stat.bg, stat.color)}>
                  <stat.icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-foreground tracking-tighter tabular-nums">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* 3. Cycle Registry */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Registry...</p>
        </div>
      ) : cycles.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl bg-muted/5 p-20 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-6 border border-border">
            <AlertCircle className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-bold text-foreground uppercase tracking-tight">No Active Strategy</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed mb-8">
            The city's democratic engine is idle. Deploy your first budget cycle to enable citizen participation.
          </p>
          <Button asChild className="h-14 bg-primary px-10 font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-primary/20">
            <Link href="/admin/participatory-budgeting/create">
              <Plus className="mr-2 h-5 w-5" /> Deploy First Cycle
            </Link>
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="active" className="w-full space-y-10">
          <div className="flex justify-center">
            <TabsList className="h-12 p-1.5 bg-muted/30 border border-border rounded-xl">
              <TabsTrigger 
                value="active"
                className="h-9 px-8 text-xs font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-xs"
              >
                Operational <span className="ml-2 opacity-40">{activeCycles.length}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="archived"
                className="h-9 px-8 text-xs font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-xs"
              >
                Historical <span className="ml-2 opacity-40">{archivedCycles.length}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="active" className="mt-0 focus-visible:outline-none">
            {activeCycles.length === 0 ? (
              <div className="py-20 text-center bg-muted/5 border border-dashed rounded-xl">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">No lifecycle active</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeCycles.map((cycle) => (
                  <CycleAdminCard key={cycle.id} cycle={cycle} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="archived" className="mt-0 focus-visible:outline-none">
            {archivedCycles.length === 0 ? (
              <div className="py-20 text-center bg-muted/5 border border-dashed rounded-xl">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">Repository empty</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {archivedCycles.map((cycle) => (
                  <CycleAdminCard key={cycle.id} cycle={cycle} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// --- Sub-component: Ultra-Clean Admin Card ---
function CycleAdminCard({ cycle }: { cycle: BudgetCycle }) {
  const now = new Date();
  const isVotingActive = now >= new Date(cycle.voting_start_at) && now <= new Date(cycle.voting_end_at);
  const isSubmissionActive = now >= new Date(cycle.submission_start_at) && now <= new Date(cycle.submission_end_at);

  return (
    <Card className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-xs hover:border-primary/30 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-8 space-y-8 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-2 flex-1">
            <h2 className="text-xl font-black text-foreground tracking-tight uppercase group-hover:text-primary transition-colors line-clamp-1 leading-tight">
              {cycle.title}
            </h2>
            <p className="text-sm text-muted-foreground/60 font-medium line-clamp-2 leading-relaxed h-8">
              {cycle.description || "System-defined budget allocation framework."}
            </p>
          </div>
          <Badge variant="outline" className={cn(
            "h-6 px-2 text-xs font-black uppercase tracking-widest rounded-full shrink-0",
            cycle.is_active 
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
              : "bg-muted text-muted-foreground"
          )}>
            {cycle.is_active ? "Operational" : "Legacy"}
          </Badge>
        </div>

        <div className="bg-muted/10 border border-border/50 rounded-2xl p-6 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">Fiscal Pool</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-foreground tracking-tighter tabular-nums">
                {(cycle.total_budget_amount / 100000).toFixed(1)}
              </span>
              <span className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest">Lakhs</span>
            </div>
          </div>
          <div className="h-10 w-px bg-border/50" />
          <div className="space-y-1 text-right">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">Phase</p>
            <p className={cn(
              "text-xs font-black uppercase tracking-widest",
              isVotingActive ? "text-primary" : isSubmissionActive ? "text-emerald-500" : "text-foreground"
            )}>
              {isVotingActive ? "Voting" : isSubmissionActive ? "Intake" : "Idle"}
            </p>
          </div>
        </div>

        <div className="space-y-4 flex-1">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-muted-foreground/40 px-1">
            <span>Intake Window</span>
            <span className="text-foreground">{format(new Date(cycle.submission_start_at), "MMM d")} - {format(new Date(cycle.submission_end_at), "MMM d, yy")}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-muted-foreground/40 px-1">
            <span>Voting Period</span>
            <span className="text-foreground">{format(new Date(cycle.voting_start_at), "MMM d")} - {format(new Date(cycle.voting_end_at), "MMM d, yy")}</span>
          </div>
        </div>
      </CardContent>

      <div className="mt-auto flex border-t border-border/50 bg-muted/5">
        <Button asChild variant="ghost" className="flex-1 h-14 rounded-none hover:bg-muted text-xs font-black uppercase tracking-widest border-r border-border/50 transition-all">
          <Link href={`/admin/participatory-budgeting/${cycle.id}/analytics`}>
            <BarChart3 className="w-4 h-4 mr-2 text-muted-foreground/40 group-hover:text-primary transition-colors" /> Analytics
          </Link>
        </Button>
        <Button asChild className="flex-1 h-14 rounded-none bg-primary hover:bg-primary/95 text-white text-xs font-black uppercase tracking-widest transition-all">
          <Link href={`/admin/participatory-budgeting/${cycle.id}`}>
            <Settings className="w-4 h-4 mr-2" /> Governance
          </Link>
        </Button>
      </div>
    </Card>
  );
}
