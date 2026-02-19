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
          <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-purple-500/20 blur-3xl animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
        </div>
        <p className="text-muted-foreground font-medium animate-pulse">
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
    <div className="container mx-auto py-8 max-w-7xl space-y-8 animate-in fade-in duration-500 px-4 sm:px-6">
      {/* 1. Enhanced Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b">
        <div className="space-y-3">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-2 pl-0 hover:pl-2 transition-all duration-300 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cycles
          </Button>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Settings2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">
                {cycle.title}
              </h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <Badge
                  variant={cycle.is_active ? "default" : "secondary"}
                  className={`px-3 py-1 ${
                    cycle.is_active
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {cycle.is_active ? (
                    <><Unlock className="h-3 w-3 mr-1.5" /> ACTIVE</>
                  ) : (
                    <><Lock className="h-3 w-3 mr-1.5" /> PAUSED</>
                  )}
                </Badge>

                {isVotingActive && (
                  <Badge className="bg-blue-600 text-white border-0 px-3 py-1">
                    <Users className="w-3 h-3 mr-1.5" /> Voting Live
                  </Badge>
                )}

                {isSubmissionActive && !isVotingActive && (
                  <Badge className="bg-purple-600 text-white border-0 px-3 py-1">
                    <FileText className="w-3 h-3 mr-1.5" /> Submissions Open
                  </Badge>
                )}

                {cycle.finalized_at && (
                  <Badge className="bg-amber-500 text-white border-0 px-3 py-1 animate-in zoom-in">
                    <Award className="w-3 h-3 mr-1.5" /> Winners Announced
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full lg:w-auto">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/participatory-budgeting/${cycle.id}/edit`)}
            className="w-full lg:w-auto"
          >
            <Settings className="w-4 h-4 mr-2" />
            Edit Configuration
          </Button>
          
          <Card className="bg-muted/40 border-dashed shadow-sm">
            <CardContent className="p-4 flex items-center justify-between gap-6">
              <div className="space-y-0.5">
                <Label htmlFor="active-toggle" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Emergency Lock
                </Label>
                <p className="text-[10px] text-muted-foreground">Stop all public activity</p>
              </div>
              <Switch
                id="active-toggle"
                checked={cycle.is_active}
                onCheckedChange={handleToggleActive}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 2. Contextual Alerts */}
      {!cycle.is_active && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Cycle Paused:</strong> Citizens cannot interact with this cycle.
          </AlertDescription>
        </Alert>
      )}

      {votingEnded && !cycle.finalized_at && (
        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-300">
            <strong>Action Required:</strong> Voting has ended. Please run the winner simulation below to finalize results.
          </AlertDescription>
        </Alert>
      )}

      {cycle.finalized_at && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 rounded-xl flex items-start gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-800 rounded-full">
            <Trophy className="h-6 w-6 text-green-700 dark:text-green-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-green-800 dark:text-green-300">Cycle Completed</h3>
            <p className="text-green-700 dark:text-green-400 mt-1">
              Winners were officially announced on {format(new Date(cycle.finalized_at), "PPP 'at' p")}.
              The results are now public on the citizen portal.
            </p>
            {cycle.concluding_message && (
              <div className="mt-4 p-4 bg-white dark:bg-black/20 rounded-lg border border-green-200 dark:border-green-800/50">
                <p className="text-sm italic text-muted-foreground">"{cycle.concluding_message}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Main Control Tabs */}
      {!cycle.finalized_at && (
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px] h-12 p-1 bg-muted/60">
            <TabsTrigger value="overview" className="h-10 font-medium">Overview</TabsTrigger>
            <TabsTrigger value="analytics" className="h-10 font-medium">Analytics</TabsTrigger>
            <TabsTrigger value="selection" className="h-10 font-bold data-[state=active]:text-primary">
              <Trophy className="w-4 h-4 mr-2" /> Winner Selection
            </TabsTrigger>
          </TabsList>

          {/* Tab: Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-primary"/> Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="relative pl-6 border-l-2 border-muted space-y-8">
                    <div className="relative">
                      <div className="absolute -left-[31px] bg-purple-500 h-4 w-4 rounded-full border-4 border-background" />
                      <p className="text-sm font-bold text-purple-600 mb-1">Submission Phase</p>
                      <p className="text-sm font-medium">{format(new Date(cycle.submission_start_at), "MMM d")} - {format(new Date(cycle.submission_end_at), "MMM d, yyyy")}</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[31px] bg-blue-500 h-4 w-4 rounded-full border-4 border-background" />
                      <p className="text-sm font-bold text-blue-600 mb-1">Voting Phase</p>
                      <p className="text-sm font-medium">{format(new Date(cycle.voting_start_at), "MMM d")} - {format(new Date(cycle.voting_end_at), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-primary"/> Fiscal Limits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/40 p-4 rounded-lg">
                    <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Total Pool</p>
                    <p className="text-3xl font-black">NPR {(cycle.total_budget_amount / 100000).toFixed(1)}L</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/40 p-4 rounded-lg">
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Min Project</p>
                      <p className="font-semibold">{(cycle.min_project_cost / 100000).toFixed(1)}L</p>
                    </div>
                    <div className="bg-muted/40 p-4 rounded-lg">
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Max Votes</p>
                      <p className="font-semibold">{cycle.max_votes_per_user} per citizen</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{analytics?.totalVotes.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total Valid Votes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{analytics?.totalProposals.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total Proposals</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader><CardTitle>Ward Breakdown</CardTitle></CardHeader>
              <CardContent>
                {analytics && Object.entries(analytics.votesByWard).map(([ward, count]) => (
                  <div key={ward} className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{ward}</span>
                      <span className="font-bold">{count} votes</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${(count / (analytics.totalVotes || 1)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Winner Selection (The Important One) */}
          <TabsContent value="selection" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column: Controls */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg">Run Simulation</CardTitle>
                    <CardDescription>Calculate winners based on budget & votes.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Test Budget Amount (NPR)</Label>
                      <Input 
                        type="number" 
                        value={budgetOverride} 
                        onChange={(e) => setBudgetOverride(e.target.value)}
                        className="font-mono"
                      />
                    </div>
                    <Button 
                      onClick={runSimulation} 
                      disabled={mutations.runSimulation.isPending} 
                      className="w-full" 
                      size="lg"
                    >
                      {mutations.runSimulation.isPending ? <Loader2 className="animate-spin mr-2"/> : <PlayCircle className="mr-2"/>}
                      Calculate Winners
                    </Button>
                  </CardContent>
                </Card>

                {simulation && (
                   <Card className="border-green-200 bg-green-50/50 dark:bg-green-900/10">
                     <CardContent className="pt-6 space-y-4">
                       <div>
                         <p className="text-xs font-bold uppercase text-muted-foreground">Allocated</p>
                         <p className="text-2xl font-black text-green-700">NPR {simulation.totalCost.toLocaleString()}</p>
                       </div>
                       <div>
                         <p className="text-xs font-bold uppercase text-muted-foreground">Surplus</p>
                         <p className="text-2xl font-black text-slate-600">NPR {simulation.remainingBudget.toLocaleString()}</p>
                       </div>
                       <Separator />
                       <div className="space-y-2">
                          <Button variant="outline" className="w-full bg-background" onClick={exportResults}>
                            <Download className="mr-2 h-4 w-4" /> Export CSV
                          </Button>
                          
                          {canFinalize && (
                            <Button 
                              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold" 
                              onClick={() => setShowFinalizeDialog(true)}
                            >
                              <Megaphone className="mr-2 h-4 w-4" /> Finalize Results
                            </Button>
                          )}
                       </div>
                     </CardContent>
                   </Card>
                )}
              </div>

              {/* Right Column: Results List */}
              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Projected Winners</CardTitle>
                    <CardDescription>
                      {simulation ? `${simulation.selectedProposals.length} projects selected` : "Run simulation to see results"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {simulation ? (
                      <div className="space-y-3">
                        {simulation.selectedProposals.map((p, i) => (
                          <div key={p.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                                {i + 1}
                              </div>
                              <div>
                                <p className="font-bold text-sm line-clamp-1">{p.title}</p>
                                <p className="text-xs text-muted-foreground">{p.category.replace(/_/g, ' ')} • {p.vote_count} votes</p>
                              </div>
                            </div>
                            <div className="text-right font-mono text-sm font-bold">
                              NPR {(p.technical_cost || p.estimated_cost).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                        <BarChart3 className="w-12 h-12 opacity-20 mb-2" />
                        <p>No results yet</p>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirm & Announce Winners</DialogTitle>
            <DialogDescription>
              This action will officially close the cycle and publish these {simulation?.selectedProposals.length} winners to the public. This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Public Announcement Message</Label>
              <Textarea 
                placeholder="Write a message to the citizens (e.g. 'Thank you for voting! We are excited to build these projects...')"
                value={concludingMessage}
                onChange={(e) => setConcludingMessage(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <Label htmlFor="notify" className="cursor-pointer">Send Email Notifications</Label>
              <Switch id="notify" checked={notifyCitizens} onCheckedChange={setNotifyCitizens} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinalizeDialog(false)}>Cancel</Button>
            <Button 
              className="bg-amber-500 hover:bg-amber-600 text-white" 
              onClick={handleFinalize} 
              disabled={mutations.finalizeWinners.isPending || !concludingMessage}
            >
              {mutations.finalizeWinners.isPending ? <Loader2 className="animate-spin mr-2"/> : <Send className="mr-2 h-4 w-4"/>}
              Confirm & Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}