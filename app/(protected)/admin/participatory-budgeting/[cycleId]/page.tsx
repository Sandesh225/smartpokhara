"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  ArrowLeft, DollarSign, Lock, Unlock, 
  BarChart3, PlayCircle, Loader2, Trophy,
  Settings2, TrendingUp, Users, FileText,
  Calendar, CheckCircle2, AlertTriangle,
  Sparkles
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { pbService, type BudgetCycle, type CycleAnalytics, type SimulationResult } from "@/lib/supabase/queries/participatory-budgeting";

export default function AdminCycleControlCenter() {
  const params = useParams();
  const router = useRouter();
  const cycleId = params.cycleId as string;

  const [cycle, setCycle] = useState<BudgetCycle | null>(null);
  const [analytics, setAnalytics] = useState<CycleAnalytics | null>(null);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [budgetOverride, setBudgetOverride] = useState<string>("");

  useEffect(() => {
    loadData();
  }, [cycleId]);

  const loadData = async () => {
    try {
      const [cycleData, analyticsData] = await Promise.all([
        pbService.getCycleById(cycleId),
        pbService.getCycleAnalytics(cycleId)
      ]);
      
      if (!cycleData) {
        toast.error("Cycle not found or access denied.");
        router.push("/admin/participatory-budgeting");
        return;
      }

      setCycle(cycleData);
      setAnalytics(analyticsData);
      setBudgetOverride(cycleData.total_budget_amount.toString());
    } catch (error) {
      console.error(error);
      toast.error("Security error: Could not load control center.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (checked: boolean) => {
    if (!cycle) return;
    try {
      const updated = await pbService.updateBudgetCycle(cycle.id, { is_active: checked });
      setCycle(updated);
      toast.success(checked ? "✅ Cycle Activated" : "⏸️ Cycle Paused");
    } catch (error) {
      toast.error("Failed to update cycle state");
    }
  };

  const runSimulation = async () => {
    setSimulating(true);
    try {
      const budget = parseFloat(budgetOverride) || 0;
      const result = await pbService.runWinnerSimulation(cycleId, budget);
      setSimulation(result);
      toast.success("🎯 Winner simulation complete");
    } catch (error) {
      toast.error("Simulation engine failed");
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 dark:from-primary/30 dark:to-purple-500/30 blur-3xl animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
        </div>
        <p className="text-base text-muted-foreground font-medium animate-pulse">
          Establishing Admin Session...
        </p>
      </div>
    );
  }

  if (!cycle) return null;

  const isVotingActive = new Date() >= new Date(cycle.voting_start_at) && 
                         new Date() <= new Date(cycle.voting_end_at);
  const isSubmissionActive = new Date() >= new Date(cycle.submission_start_at) && 
                             new Date() <= new Date(cycle.submission_end_at);

  return (
    <div className="container mx-auto py-8 max-w-7xl space-y-8 animate-in fade-in duration-500 px-4 sm:px-6">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-3">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="mb-2 pl-0 hover:pl-2 transition-all duration-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cycles
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 dark:bg-primary/30 rounded-xl">
              <Settings2 className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">
                {cycle.title}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge 
                  variant={cycle.is_active ? "default" : "secondary"}
                  className={cycle.is_active 
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" 
                    : "bg-muted"
                  }
                >
                  {cycle.is_active ? (
                    <>
                      <Unlock className="h-3 w-3 mr-1" />
                      ACTIVE
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3 mr-1" />
                      PAUSED
                    </>
                  )}
                </Badge>
                
                {isVotingActive && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <Users className="w-3 h-3 mr-1" />
                    Voting Live
                  </Badge>
                )}
                
                {isSubmissionActive && !isVotingActive && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <FileText className="w-3 h-3 mr-1" />
                    Submissions Open
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <Card className="bg-gradient-to-br from-muted/40 to-muted/20 border-2 border-dashed border-muted-foreground/20 shadow-lg">
          <CardContent className="p-5 flex items-center gap-6">
            <div className="space-y-1">
              <Label htmlFor="active-toggle" className="text-sm font-bold uppercase tracking-wider">
                Global Status
              </Label>
              <p className="text-xs text-muted-foreground">
                Emergency lock for all citizens
              </p>
            </div>
            <Switch 
              id="active-toggle" 
              checked={cycle.is_active} 
              onCheckedChange={handleToggleActive}
              className="data-[state=checked]:bg-green-600"
            />
          </CardContent>
        </Card>
      </div>

      {/* Status Alert */}
      {!cycle.is_active && (
        <Alert className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-900 dark:text-yellow-200">
            <strong>Cycle Paused:</strong> Citizens cannot submit proposals or vote while the cycle is inactive.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl bg-muted/50 dark:bg-muted/30 p-1 h-12 rounded-xl">
          <TabsTrigger 
            value="overview"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300"
          >
            <Settings2 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="heatmap"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="selection"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Winners
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-xl bg-gradient-to-br from-card to-card/95">
              <CardHeader className="bg-gradient-to-br from-muted/30 to-transparent dark:from-muted/20 border-b pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Timeline Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border-2 border-purple-200 dark:border-purple-800 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="font-bold text-purple-900 dark:text-purple-200">Submission Period</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Citizens can submit proposals</p>
                    <p className="font-mono font-bold text-purple-700 dark:text-purple-400">
                      {format(new Date(cycle.submission_start_at), "MMM d, yyyy 'at' HH:mm")}
                    </p>
                    <p className="text-xs text-muted-foreground">to</p>
                    <p className="font-mono font-bold text-purple-700 dark:text-purple-400">
                      {format(new Date(cycle.submission_end_at), "MMM d, yyyy 'at' HH:mm")}
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-bold text-blue-900 dark:text-blue-200">Voting Period</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Citizens can vote on approved proposals</p>
                    <p className="font-mono font-bold text-blue-700 dark:text-blue-400">
                      {format(new Date(cycle.voting_start_at), "MMM d, yyyy 'at' HH:mm")}
                    </p>
                    <p className="text-xs text-muted-foreground">to</p>
                    <p className="font-mono font-bold text-blue-700 dark:text-blue-400">
                      {format(new Date(cycle.voting_end_at), "MMM d, yyyy 'at' HH:mm")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl bg-gradient-to-br from-primary/5 to-primary/0 border-primary/20">
              <CardHeader className="bg-gradient-to-br from-primary/10 to-transparent border-b pb-4">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Budget Allocation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="p-5 bg-gradient-to-br from-white to-primary/5 dark:from-slate-900 dark:to-primary/10 border-2 border-primary/30 rounded-xl shadow-md">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    Total Fiscal Pool
                  </p>
                  <p className="text-4xl font-black bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    NPR {cycle.total_budget_amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(cycle.total_budget_amount / 100000).toFixed(1)} Lakhs
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border-2 rounded-xl bg-gradient-to-br from-background to-muted/10 hover:border-primary/30 transition-colors">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase mb-1">
                      Min Project
                    </p>
                    <p className="font-bold text-lg">
                      NPR {cycle.min_project_cost.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 border-2 rounded-xl bg-gradient-to-br from-background to-muted/10 hover:border-primary/30 transition-colors">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase mb-1">
                      Vote Limit
                    </p>
                    <p className="font-bold text-lg flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {cycle.max_votes_per_user}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-xl bg-gradient-to-br from-card to-card/95">
              <CardHeader className="bg-gradient-to-br from-muted/30 to-transparent dark:from-muted/20 border-b">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Engagement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="p-5 border-2 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                    Total Participation
                  </p>
                  <p className="text-5xl font-black text-green-700 dark:text-green-400">
                    {analytics?.totalVotes.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-2 font-semibold">
                    ✓ Confirmed valid votes
                  </p>
                </div>

                <div className="p-5 border-2 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Total Proposals
                  </p>
                  <p className="text-5xl font-black text-blue-700 dark:text-blue-400">
                    {analytics?.totalProposals.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 shadow-xl bg-gradient-to-br from-card to-card/95">
              <CardHeader className="bg-gradient-to-br from-muted/30 to-transparent dark:from-muted/20 border-b">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Ward Performance
                </CardTitle>
                <CardDescription>Vote distribution across wards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                {analytics && Object.entries(analytics.votesByWard).length > 0 ? (
                  Object.entries(analytics.votesByWard).map(([ward, count]) => (
                    <div key={ward} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-foreground">{ward}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-muted-foreground">
                            {count} votes
                          </span>
                          <span className="text-xs font-bold text-primary">
                            {((count / (analytics.totalVotes || 1)) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500" 
                          style={{ width: `${(count / (analytics.totalVotes || 1)) * 100}%` }} 
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No voting data yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="selection" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="h-fit shadow-xl bg-gradient-to-br from-card to-card/95">
              <CardHeader className="bg-gradient-to-br from-primary/10 to-transparent dark:from-primary/20 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Winner Simulation
                </CardTitle>
                <CardDescription>Calculate optimal project selection</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label className="font-semibold flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Budget Sensitivity (NPR)
                  </Label>
                  <Input 
                    type="number" 
                    value={budgetOverride} 
                    onChange={(e) => setBudgetOverride(e.target.value)} 
                    className="font-mono text-lg font-bold bg-gradient-to-br from-background to-muted/10 border-2 focus:border-primary h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    Test different budget scenarios
                  </p>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all h-12 font-semibold" 
                  onClick={runSimulation} 
                  disabled={simulating}
                  size="lg"
                >
                  {simulating ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Calculate Winners
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 shadow-xl bg-gradient-to-br from-card to-card/95">
              <CardHeader className="bg-gradient-to-br from-muted/30 to-transparent dark:from-muted/20 border-b">
                <CardTitle>Projected Outcomes</CardTitle>
                {simulation && (
                  <CardDescription>
                    Budget utilized: <strong className="text-primary">{simulation.utilizationRate.toFixed(1)}%</strong>
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-6">
                {simulation ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-800 rounded-xl">
                        <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase mb-2 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Allocated
                        </p>
                        <p className="text-3xl font-black text-green-900 dark:text-green-100">
                          NPR {simulation.totalCost.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 rounded-xl">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">
                          Surplus
                        </p>
                        <p className="text-3xl font-black text-slate-900 dark:text-slate-100">
                          NPR {simulation.remainingBudget.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground pb-2 border-b flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-primary" />
                        Winning Ballot ({simulation.selectedProposals.length} Projects)
                      </h4>
                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                        {simulation.selectedProposals.map((p, idx) => (
                          <div 
                            key={p.id} 
                            className="flex items-center justify-between p-4 border-2 rounded-xl hover:bg-muted/50 transition-all duration-300 hover:border-primary/30 group"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center text-xs font-black shrink-0 shadow-md">
                                {idx + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                                  {p.title}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  <p className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {p.vote_count} votes
                                  </p>
                                  <p className="text-[11px] font-medium text-muted-foreground">
                                    {p.category.replace(/_/g, " ")}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="font-mono font-bold text-sm ml-4 text-primary shrink-0">
                              {(p.technical_cost || p.estimated_cost).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-80 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-2xl bg-muted/10">
                    <BarChart3 className="h-16 w-16 mb-3 opacity-20" />
                    <p className="text-sm font-medium">Simulation Idle</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      Run simulation to see winning projects
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}