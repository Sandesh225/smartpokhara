"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ArrowLeft,
  DollarSign,
  Lock,
  Unlock,
  BarChart3,
  PlayCircle,
  Loader2,
  Trophy,
  Settings2,
  TrendingUp,
  Users,
  FileText,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Settings,
  Send,
  Award,
  Building2,
  PieChart,
  Clock,
  Megaphone,
  Download,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// Domain Features
import { 
  useBudgetCycle, 
  usePBAnalytics, 
  usePBMutations,
  type BudgetCycle,
  type CycleAnalytics,
  type SimulationResult 
} from "@/features/participatory-budgeting";
import { cn } from "@/lib/utils";

export default function AdminCycleControlCenter() {
  const params = useParams();
  const router = useRouter();
  const cycleId = params.cycleId as string;

  // Domain Hooks
  const { data: cycle, isLoading: cycleLoading, error: cycleError } = useBudgetCycle(cycleId);
  const { data: analytics } = usePBAnalytics(cycleId);
  const mutations = usePBMutations();

  // local simulation state (persists during admin session)
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [budgetOverride, setBudgetOverride] = useState<string>("");

  // Finalization state
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false);
  const [concludingMessage, setConcludingMessage] = useState("");
  const [notifyCitizens, setNotifyCitizens] = useState(true);

  // Sync budget override when cycle loads
  useEffect(() => {
    if (cycle) {
      setBudgetOverride(cycle.total_budget_amount.toString());
      if (cycle.concluding_message) {
        setConcludingMessage(cycle.concluding_message);
      }
    }
  }, [cycle]);

  // Error handling
  useEffect(() => {
    if (cycleError) {
      toast.error("Cycle not found or access denied.");
      router.push("/admin/participatory-budgeting");
    }
  }, [cycleError, router]);

  // --- Actions ---

  const handleToggleActive = async (checked: boolean) => {
    if (!cycleId) return;
    mutations.updateCycle.mutate({
      id: cycleId,
      data: { is_active: checked }
    }, {
      onSuccess: () => {
        toast.success(checked ? "✅ Cycle Activated" : "⏸️ Cycle Paused");
      }
    });
  };

  const runSimulation = async () => {
    const budget = parseFloat(budgetOverride) || 0;
    mutations.runSimulation.mutate({
      cycleId,
      budget
    }, {
      onSuccess: (result) => {
        setSimulation(result);
        toast.success("🎯 Winner simulation complete");
      }
    });
  };

  const handleFinalize = async () => {
    if (!simulation || !cycleId) return;

    mutations.finalizeWinners.mutate({
      cycleId,
      winnerIds: simulation.selectedProposals.map((p) => p.id),
      concludingMessage
    }, {
      onSuccess: () => {
        setShowFinalizeDialog(false);
        toast.success("🏆 Winners officially announced!");
      }
    });
  };

  const exportResults = () => {
    if (!simulation) return;

    const csvContent = [
      ["Rank", "Project Title", "Category", "Department", "Cost", "Votes", "Ward"],
      ...simulation.selectedProposals.map((p, idx) => [
        idx + 1,
        `"${p.title.replace(/"/g, '""')}"`, // Handle commas in titles
        p.category.replace(/_/g, " "),
        p.department?.name || "N/A",
        p.technical_cost || p.estimated_cost,
        p.vote_count,
        p.ward_name || "N/A",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `winning-projects-${cycle?.title.replace(/\s/g, "-")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // --- Calculations ---

  // Calculate departmental distribution
  const deptDistribution = simulation?.selectedProposals.reduce((acc, p) => {
    const name = p.department?.name || "Other";
    const cost = p.technical_cost || p.estimated_cost;
    acc[name] = (acc[name] || 0) + cost;
    return acc;
  }, {} as Record<string, number>);

  // Calculate category distribution
  const categoryDistribution = simulation?.selectedProposals.reduce(
    (acc, p) => {
      const category = p.category.replace(/_/g, " ");
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Check if voting has ended
  const votingEnded = cycle ? new Date() > new Date(cycle.voting_end_at) : false;
  const canFinalize = simulation && votingEnded && simulation.selectedProposals.length > 0;

  // --- Rendering ---

  if (cycleLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse" />
          <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">
          Establishing Admin Session...
        </p>
      </div>
    );
  }

  if (!cycle) return null;

  const isVotingActive =
    new Date() >= new Date(cycle.voting_start_at) &&
    new Date() <= new Date(cycle.voting_end_at);
  const isSubmissionActive =
    new Date() >= new Date(cycle.submission_start_at) &&
    new Date() <= new Date(cycle.submission_end_at);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 px-6 md:px-8">
      {/* 1. Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-8 md:p-10 shadow-sm mt-6 text-center">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-50" />
        
        <div className="relative space-y-4 max-w-3xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="h-8 gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Cycles
          </Button>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
            Control Center
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground uppercase leading-tight">
            Cycle <span className="text-primary">Management</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
            Overseeing <span className="text-foreground font-bold">{cycle.title}</span>. Monitor live engagement and finalize democratic outcomes.
          </p>

          <div className="flex items-center justify-center gap-3 pt-4">
             <Badge variant="outline" className={cn(
               "h-7 px-3 text-xs font-black uppercase tracking-widest rounded-full",
               cycle.is_active ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-muted text-muted-foreground"
             )}>
               {cycle.is_active ? "Live" : "Paused"}
             </Badge>
             {cycle.finalized_at && (
               <Badge variant="outline" className="h-7 px-3 text-xs font-black uppercase tracking-widest rounded-full bg-amber-500/10 text-amber-600 border-amber-500/20">
                 Published
               </Badge>
             )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/admin/participatory-budgeting/${cycle.id}/edit`)}
                className="h-7 text-xs font-black uppercase tracking-widest rounded-md px-3 border-border hover:bg-muted"
              >
                <Settings className="w-3 h-3 mr-1.5" />
                Configure
              </Button>
          </div>
        </div>
      </div>

      {/* 2. Global Strategy Bar */}
      <div className="bg-muted/10 border border-border p-4 rounded-xl flex items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 px-4 py-2 bg-card border border-border rounded-lg shadow-xs">
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Live Activity</span>
            <Switch
              checked={cycle.is_active}
              onCheckedChange={handleToggleActive}
              className="scale-75"
            />
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-6 text-xs font-black uppercase tracking-widest text-muted-foreground/60">
             <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /> Submission Active</span>
             <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-muted" /> Voting Active</span>
          </div>
        </div>
      </div>

      {/* 3. Alerts */}
      {!cycle.is_active && (
        <Alert variant="destructive" className="rounded-xl border-rose-200/50 bg-rose-50 dark:bg-rose-950/20 py-3">
          <AlertTriangle className="h-3.5 w-3.5" />
          <AlertDescription className="text-xs font-black uppercase tracking-widest text-rose-600">
            System Restricted: <span className="font-medium normal-case tracking-normal">Citizen interactions are currently disabled for this cycle.</span>
          </AlertDescription>
        </Alert>
      )}

      {votingEnded && !cycle.finalized_at && (
        <Alert className="rounded-xl border-primary/20 bg-primary/5 py-3">
          <Trophy className="h-3.5 w-3.5 text-primary" />
          <AlertDescription className="text-xs font-black uppercase tracking-widest text-primary">
            Awaiting Finalization: <span className="font-medium normal-case tracking-normal text-foreground/80">Voting has concluded. Initialize the winner simulation to publish results.</span>
          </AlertDescription>
        </Alert>
      )}

      {cycle.finalized_at && (
        <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-2xl flex items-start gap-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Trophy className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-black uppercase tracking-tight text-emerald-900 leading-none">Democratic Results Published</h3>
            <p className="text-sm text-emerald-800/70 leading-relaxed max-w-2xl">
              Cycle outcome officially announced on <span className="text-emerald-900 font-bold">{format(new Date(cycle.finalized_at), "PPP")}</span>.
              The citizens can now view winning projects in the implementation tracker.
            </p>
            {cycle.concluding_message && (
              <div className="mt-4 p-4 bg-muted/20 rounded-xl border border-emerald-500/20 border-dashed">
                <p className="text-sm italic text-muted-foreground leading-relaxed">"{cycle.concluding_message}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Tabular Controls */}
      {!cycle.finalized_at && (
        <Tabs defaultValue="overview" className="space-y-10">
          <div className="flex justify-center">
            <TabsList className="h-12 p-1.5 bg-muted/30 border border-border rounded-xl">
              <TabsTrigger value="overview" className="h-9 px-8 text-xs font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-xs">Config</TabsTrigger>
              <TabsTrigger value="analytics" className="h-9 px-8 text-xs font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-xs">Analytics</TabsTrigger>
              <TabsTrigger 
                value="selection" 
                className="h-9 px-8 text-xs font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Simulation
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="rounded-xl border-border shadow-xs">
                <CardHeader className="p-6 border-b border-border/50 bg-muted/10">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-primary"/> Phase Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-12">
                  <div className="flex items-start gap-6 group">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                    <div className="space-y-1">
                      <p className="text-xs font-black uppercase tracking-widest text-primary">Submission Phase</p>
                      <p className="text-xl font-black text-foreground">
                        {format(new Date(cycle.submission_start_at), "MMM d")} — {format(new Date(cycle.submission_end_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-6 group opacity-60">
                    <div className="w-2.5 h-2.5 rounded-full bg-muted mt-1.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Voting Phase</p>
                      <p className="text-xl font-black text-foreground">
                        {format(new Date(cycle.voting_start_at), "MMM d")} — {format(new Date(cycle.voting_end_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-border shadow-xs">
                <CardHeader className="p-6 border-b border-border/50 bg-muted/10">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-primary"/> Fiscal Constraints
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-8 border-b border-border/50">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Cycle Budget Limit</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-foreground tracking-tighter">
                        NPR {(cycle.total_budget_amount / 100000).toFixed(1)}
                      </span>
                      <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Lakhs</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="p-8 border-r border-border/50">
                       <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Min Project</p>
                       <p className="text-xl font-black text-foreground">{(cycle.min_project_cost / 100000).toFixed(1)} Lakhs</p>
                    </div>
                    <div className="p-8">
                       <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Max Votes</p>
                       <p className="text-xl font-black text-foreground">{cycle.max_votes_per_user}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Gross Participation", val: analytics?.totalVotes || 0, icon: Users, color: "text-primary", bg: "bg-primary/5" },
                { label: "Proposals Logged", val: analytics?.totalProposals || 0, icon: FileText, color: "text-secondary", bg: "bg-secondary/5" },
                { label: "Community Signal", val: (analytics?.participationRate || 0).toFixed(1) + "%", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/5" },
              ].map((stat, i) => (
                <Card key={i} className="rounded-xl border-border shadow-xs overflow-hidden">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-1.5">{stat.label}</p>
                      <p className="text-3xl font-black text-foreground tracking-tight">{stat.val}</p>
                    </div>
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg)}>
                      <stat.icon className={cn("w-6 h-6", stat.color)} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="rounded-2xl border-border shadow-xs overflow-hidden">
               <CardHeader className="p-8 border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground">Ward Distributions</CardTitle>
                    <CardDescription className="text-xs uppercase font-medium tracking-widest mt-1">Geographic density of citizen engagement</CardDescription>
                  </div>
                  <PieChart className="w-5 h-5 text-muted-foreground/40" />
               </CardHeader>
               <CardContent className="p-8">
                 <div className="grid sm:grid-cols-2 gap-x-16 gap-y-8">
                   {analytics && Object.entries(analytics.votesByWard).map(([ward, count]) => (
                     <div key={ward} className="space-y-3">
                       <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                         <span className="text-foreground">{ward}</span>
                         <span className="text-primary">{count} votes</span>
                       </div>
                       <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                         <div className="h-full bg-primary/80 transition-all duration-1000" style={{ width: `${(count / (analytics.totalVotes || 1)) * 100}%` }} />
                       </div>
                     </div>
                   ))}
                 </div>
               </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="selection" className="space-y-10">
            <div className="grid lg:grid-cols-3 gap-10">
              {/* Controls */}
              <div className="lg:col-span-1">
                <Card className="rounded-2xl border-primary/20 shadow-xl overflow-hidden sticky top-8">
                  <CardHeader className="p-8 bg-primary/5 border-b border-primary/10">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-3">
                      <Sparkles className="w-5 h-5"/> Allocation Engine
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-3">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Simulated Budget Cap (NPR)</Label>
                      <Input 
                        type="number" 
                        value={budgetOverride} 
                        onChange={(e) => setBudgetOverride(e.target.value)}
                        className="h-14 font-black text-xl border-border bg-muted/10 focus:bg-background rounded-xl"
                      />
                    </div>
                    <Button 
                      onClick={runSimulation} 
                      disabled={mutations.runSimulation.isPending} 
                      className="w-full h-14 bg-primary text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 transition-all" 
                    >
                      {mutations.runSimulation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : null}
                      Initialize Simulation
                    </Button>

                    {simulation && (
                      <div className="pt-6 space-y-6 animate-in fade-in slide-in-from-top-4">
                        <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-4">
                          <div className="flex justify-between items-start">
                            <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Projected Spend</p>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </div>
                          <p className="text-2xl font-black text-emerald-700 tracking-tight">NPR {simulation.totalCost.toLocaleString()}</p>
                          <div className="h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-500" style={{ width: `${(simulation.totalCost / parseFloat(budgetOverride || '1')) * 100}%` }} />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Button variant="outline" className="w-full h-12 text-xs font-black uppercase tracking-widest rounded-xl border-border/60" onClick={exportResults}>
                            <Download className="mr-2 h-4 w-4" /> Comprehensive CSV Export
                          </Button>
                          
                          {canFinalize && (
                            <Button 
                              className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 mt-4" 
                              onClick={() => setShowFinalizeDialog(true)}
                            >
                              <Megaphone className="mr-2 h-5 w-5" /> Official Publication
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Results */}
              <div className="lg:col-span-2">
                <Card className="rounded-2xl border-border shadow-xs min-h-[600px] flex flex-col overflow-hidden">
                  <CardHeader className="p-8 border-b border-border/50 bg-muted/5">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground flex items-center justify-between">
                       Provisional Success List
                       {simulation && <span className="text-xs bg-muted px-2.5 py-1 rounded-full">{simulation.selectedProposals.length} Projects Selected</span>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 flex-1">
                    {simulation ? (
                      <div className="space-y-4">
                        {simulation.selectedProposals.map((p, i) => (
                          <div key={p.id} className="group relative flex items-center justify-between p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all">
                            <div className="flex items-center gap-6">
                              <div className="h-12 w-12 rounded-xl bg-muted group-hover:bg-primary/5 border border-border flex items-center justify-center font-black text-lg transition-colors">
                                {i + 1}
                              </div>
                              <div className="space-y-2">
                                <p className="font-black text-base text-foreground group-hover:text-primary transition-colors leading-tight">{p.title}</p>
                                <div className="flex items-center gap-3">
                                  <Badge variant="secondary" className="bg-muted border-none text-xs font-black uppercase tracking-widest px-2 py-0.5">
                                    {p.category.replace(/_/g, ' ')}
                                  </Badge>
                                  <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> {p.vote_count} VOTES
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40 mb-1 leading-none">Cost Point</p>
                              <p className="text-lg font-black text-foreground tabular-nums">
                                {( (p.technical_cost || p.estimated_cost) / 100000).toFixed(2)}L
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full py-32 flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-6">
                        <div className="w-24 h-24 rounded-[32px] bg-muted/30 border border-border flex items-center justify-center">
                          <BarChart3 className="w-10 h-10 text-muted-foreground/20" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Engine Standby</p>
                          <p className="text-sm text-muted-foreground/60 leading-relaxed font-medium">Define simulation parameters and initialize the engine to identify winning projects based on voting density and fiscal constraints.</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* 4. Finalization Modal */}
      <Dialog open={showFinalizeDialog} onOpenChange={setShowFinalizeDialog}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
          <div className="bg-primary px-8 py-10 text-primary-foreground relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-3xl opacity-50" />
            <h2 className="text-3xl font-black tracking-tight uppercase leading-none">Commit Results</h2>
            <p className="text-sm opacity-80 mt-3 font-medium leading-relaxed max-w-sm">
              This will finalize the democratic process for this cycle. <span className="text-white font-bold underline underline-offset-4">This action is irreversible.</span>
            </p>
          </div>

          <div className="p-8 space-y-8 bg-card">
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Strategic Announcement Message</Label>
              <Textarea 
                placeholder="Compose a concluding narrative for the community..."
                value={concludingMessage}
                onChange={(e) => setConcludingMessage(e.target.value)}
                className="min-h-[160px] resize-none border-border bg-muted/10 focus:bg-background rounded-2xl p-6 text-sm font-medium leading-relaxed"
              />
            </div>
            
            <div className="flex items-center justify-between p-6 bg-muted/10 rounded-2xl border border-border/50">
              <div className="space-y-1">
                <Label htmlFor="notify" className="text-xs font-black uppercase tracking-widest text-foreground cursor-pointer">Broadcasting</Label>
                <p className="text-xs text-muted-foreground font-medium">Trigger email alerts for all 1,204 active voters</p>
              </div>
              <Switch id="notify" checked={notifyCitizens} onCheckedChange={setNotifyCitizens} className="scale-110" />
            </div>
          </div>

          <div className="px-8 py-6 bg-muted/30 border-t border-border flex items-center gap-4">
            <Button variant="ghost" className="flex-1 h-14 text-xs font-black uppercase tracking-widest rounded-2xl" onClick={() => setShowFinalizeDialog(false)}>Abondon Process</Button>
            <Button 
              className="flex-2 h-14 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-amber-500/20" 
              onClick={handleFinalize} 
              disabled={mutations.finalizeWinners.isPending || !concludingMessage}
            >
              {mutations.finalizeWinners.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : <Send className="w-5 h-5 mr-2"/>}
              Publish Results
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>

  );
}