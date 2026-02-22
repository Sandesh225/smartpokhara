"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Loader2,
  MapPin,
  DollarSign,
  Building,
  MessageSquare,
  AlertTriangle,
  Calculator,
  User,
  ArrowLeft,
  CheckCircle,
  X,
  Clock,
  TrendingUp,
  FileText,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { createClient } from "@/lib/supabase/client";
import { 
  pbApi, 
  type BudgetProposal, 
  type ProposalStatus, 
  type BudgetCycle 
} from "@/features/participatory-budgeting";

export default function ReviewProposalPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.proposalId as string;

  // State Management
  const supabase = createClient();
  const [proposal, setProposal] = useState<BudgetProposal | null>(null);
  const [cycle, setCycle] = useState<BudgetCycle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [technicalCost, setTechnicalCost] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch Proposal and Cycle
  useEffect(() => {
    const fetchProposalAndCycle = async () => {
      if (!proposalId) {
        setErrorMessage("Invalid proposal ID");
        setIsLoading(false);
        return;
      }

      try {
        console.log("🔍 Fetching proposal:", proposalId);
        const data = await pbApi.getProposalById(supabase, proposalId);

        if (data) {
          console.log("✅ Proposal loaded successfully:", {
            id: data.id,
            title: data.title,
            status: data.status,
            department_id: data.department_id,
            department_name: data.department?.name,
            cycle_id: data.cycle_id,
          });

          setProposal(data);
          setNotes(data.admin_notes || "");
          setTechnicalCost(data.technical_cost || data.estimated_cost);
          setErrorMessage(null);

          // NEW: Fetch the cycle information using the cycle_id from the proposal
          if (data.cycle_id) {
            console.log("🔍 Fetching cycle:", data.cycle_id);
            const cycleData = await pbApi.getCycleById(supabase, data.cycle_id);
            if (cycleData) {
              console.log("✅ Cycle loaded successfully:", {
                id: cycleData.id,
                name: cycleData.title,
                total_budget: cycleData.total_budget_amount,
              });
              setCycle(cycleData);
            } else {
              console.warn("⚠️ Cycle not found for ID:", data.cycle_id);
            }
          }
        } else {
          console.warn(
            "⚠️ No proposal data returned - RLS may have blocked access"
          );
          setErrorMessage(
            "You don't have permission to view this proposal. It may belong to a different department."
          );
        }
      } catch (error) {
        console.error("❌ Error fetching proposal and cycle:", error);
        setErrorMessage("Failed to load proposal. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProposalAndCycle();
  }, [proposalId]);

  // Handle Status Change
  const handleStatusChange = async (newStatus: ProposalStatus) => {
    if (!proposal) return;

    // Validate rejection reason
    if (newStatus === "rejected" && !notes.trim()) {
      toast.error("Please provide a reason for rejection in the notes.");
      return;
    }

    // Validate technical cost
    if (technicalCost <= 0) {
      toast.error("Please enter a valid technical cost estimate.");
      return;
    }

    setProcessing(true);
    try {
      console.log("🔄 Updating proposal status:", {
        proposalId: proposal.id,
        newStatus,
        notes,
        technicalCost,
      });

      await pbApi.updateProposalStatus(
        supabase,
        proposal.id,
        newStatus,
        notes,
        technicalCost
      );

      toast.success(
        `Proposal ${newStatus === "approved_for_voting" ? "approved" : "rejected"} successfully!`
      );

      // Navigate back to inbox
      router.push("/supervisor/participatory-budgeting");
      router.refresh();
    } catch (error: any) {
      console.error("❌ Update failed:", error);

      // More detailed error message
      const errorMsg = error?.message || "Unknown error occurred";

      if (errorMsg.includes("permission") || errorMsg.includes("denied")) {
        toast.error(
          "Permission denied. You may not have access to this proposal's department."
        );
      } else if (errorMsg.includes("not found")) {
        toast.error("Proposal not found or has been deleted.");
      } else {
        toast.error(`Failed to update: ${errorMsg}`);
      }
    } finally {
      setProcessing(false);
    }
  };

  // Quick Note Templates
  const handleQuickNote = (value: string) => {
    setNotes((prev) => (prev ? prev + "\n" + value : value));
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-purple-500/20 blur-3xl animate-pulse" />
          <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10 mb-4" />
        </div>
        <p className="text-muted-foreground font-medium">
          Loading proposal details...
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">Please wait</p>
      </div>
    );
  }

  // Error State
  if (errorMessage || !proposal) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4 max-w-2xl mx-auto">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-yellow-500/10 dark:bg-yellow-500/20 blur-3xl rounded-full" />
          <div className="relative bg-linear-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 p-6 rounded-2xl border border-yellow-200/50 dark:border-yellow-800/50">
            <AlertTriangle className="w-16 h-16 text-yellow-600 dark:text-yellow-500 mx-auto" />
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-3 bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
          Access Denied
        </h3>
        <p className="text-muted-foreground mb-8 text-lg">
          {errorMessage ||
            "This proposal may not exist, or you do not have permission to view it."}
        </p>

        <Card className="w-full bg-linear-to-br from-muted/50 to-muted/30 dark:from-muted/20 dark:to-muted/10 border-muted-foreground/20">
          <CardContent className="pt-6 space-y-3">
            <p className="font-semibold text-sm flex items-center gap-2 text-foreground">
              <FileText className="w-4 h-4" />
              Possible reasons:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>The proposal belongs to a different department</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  Your supervisor profile lacks the required permissions
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>The proposal may have been deleted</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Button
          onClick={() => router.back()}
          className="mt-8 bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Return to Inbox
        </Button>
      </div>
    );
  }

  // Calculate Impact based on the ACTUAL cycle budget
  const totalBudget = cycle?.total_budget_amount || 60000000; // Fallback to 60M if cycle not loaded yet
  const impactPercentage = (technicalCost / totalBudget) * 100;

  // Logic: If one project takes more than 25% of the WHOLE city budget, warn the supervisor
  const isHighImpact = impactPercentage > 25;

  const costDifference = technicalCost - proposal.estimated_cost;
  const costDifferencePercent = (
    (costDifference / proposal.estimated_cost) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 px-6 md:px-8">
      {/* 1. Ultra-Clean Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-8 md:p-12 shadow-sm mt-6">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-30" />
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
          <div className="space-y-6">
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Vetting Queue
            </button>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
                {proposal.category.replace(/_/g, " ")}
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground uppercase leading-none">
                Vetting <span className="text-primary">Registry</span>
              </h1>
              <p className="text-sm md:text-base text-muted-foreground font-medium max-w-2xl leading-relaxed">
                Technical assessment for <span className="text-foreground font-bold">{proposal.title}</span>. Verify fiscal data and societal impact before validation.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 shrink-0 items-end">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-widest shadow-sm">
              Status: {proposal.status.replace(/_/g, " ")}
            </Badge>
            <div className="flex items-center gap-2 text-muted-foreground/40">
               <Clock className="w-3 h-3" />
               <span className="text-xs font-black uppercase tracking-widest tabular-nums">
                 Submitted {format(new Date(proposal.created_at), "MMM d, yyyy")}
               </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Proposal Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-xl border border-border shadow-xs bg-card">
            <CardHeader className="p-8 md:p-10 border-b border-border/50 bg-muted/10">
              <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="space-y-6 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 rounded bg-primary text-white text-xs font-black uppercase tracking-widest">
                      {proposal.category.replace(/_/g, " ")}
                    </span>
                    {proposal.department && (
                      <span className="px-2 py-0.5 rounded border border-border bg-background text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <Building className="w-3 h-3 opacity-50" />
                        {proposal.department.name}
                      </span>
                    )}
                    {cycle && (
                      <span className="px-2 py-0.5 rounded border border-emerald-200/30 bg-emerald-50/50 text-emerald-700 text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 opacity-50" />
                        {cycle.title}
                      </span>
                    )}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight leading-none">
                    {proposal.title}
                  </h2>
                </div>
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 flex flex-col items-center justify-center shrink-0 min-w-[160px]">
                  <span className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">Estimated Cost</span>
                  <p className="text-xl font-black text-primary">NPR {proposal.estimated_cost.toLocaleString()}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 md:p-10 space-y-10">
              <div className="space-y-4">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest border-l-2 border-primary pl-3">Narrative</h3>
                <p className="text-base text-foreground font-medium leading-relaxed bg-muted/20 p-6 rounded-xl border border-border/50 italic">
                  "{proposal.description}"
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl border border-border bg-muted/10 space-y-2">
                  <span className="text-xs font-black text-muted-foreground uppercase tracking-widest opacity-60">Citizen Author</span>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-sm font-bold text-foreground uppercase tracking-tight">{proposal.author?.full_name}</p>
                  </div>
                </div>
                <div className="p-5 rounded-xl border border-border bg-muted/10 space-y-2">
                  <span className="text-xs font-black text-muted-foreground uppercase tracking-widest opacity-60">Location Context</span>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-sm font-bold text-foreground uppercase tracking-tight">{proposal.address_text || "Pokhara Metro"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Vetting Console */}
        <div className="space-y-6">
          <Card className="rounded-xl border border-border shadow-xs bg-card overflow-hidden">
            <CardHeader className="p-6 border-b border-border/50 bg-muted/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calculator className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Technical Vetting</h3>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest opacity-60">Final Capital Allocation</label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    type="number"
                    className="pl-10 pr-4 h-12 font-black text-lg bg-muted/10 border-border/50 focus:border-primary transition-all rounded-xl"
                    value={technicalCost}
                    onChange={(e) => setTechnicalCost(Number(e.target.value))}
                  />
                </div>
                {costDifference !== 0 && (
                  <div className={cn(
                    "flex items-center justify-between p-3 rounded-lg border text-xs font-black uppercase tracking-widest",
                    costDifference > 0 ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                  )}>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3 h-3 opacity-50" />
                      <span>Budget Variance</span>
                    </div>
                    <span>{costDifference > 0 ? "+" : ""}{costDifference.toLocaleString()} ({costDifferencePercent}%)</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-dashed border-border/50">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                  <span className="text-muted-foreground/60">City Pool Impact</span>
                  <span className={isHighImpact ? "text-rose-600" : "text-emerald-600"}>{impactPercentage.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full transition-all duration-700", isHighImpact ? "bg-rose-500" : "bg-emerald-500")}
                    style={{ width: `${Math.min(impactPercentage, 100)}%` }}
                  />
                </div>
                {isHighImpact && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <p className="text-xs font-black text-rose-700 uppercase tracking-widest leading-relaxed">System warning: High budget impact detected.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-border shadow-xs bg-card overflow-hidden">
            <CardHeader className="p-6 border-b border-border/50 bg-muted/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Verdict Console</h3>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest opacity-60">Admin Rationale</label>
                  <Select onValueChange={handleQuickNote}>
                    <SelectTrigger className="h-7 w-[130px] font-black text-xs uppercase tracking-widest rounded-lg border-border/50 bg-muted/20">
                      <SelectValue placeholder="Quick Notes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Approved. Meets all technical criteria.">Meets Criteria</SelectItem>
                      <SelectItem value="Adjusted cost estimate to reflect market rates.">Cost Adjusted</SelectItem>
                      <SelectItem value="Rejected. Land ownership dispute.">Land Dispute</SelectItem>
                      <SelectItem value="Rejected. Duplicate of existing project.">Duplicate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  placeholder="Official comments for the citizen..."
                  className="min-h-[140px] rounded-xl bg-muted/10 border-border/50 focus:border-primary transition-all p-4 text-sm font-medium"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-0 flex flex-col gap-3">
              <Button
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/10 transition-all text-xs"
                onClick={() => handleStatusChange("approved_for_voting")}
                disabled={processing}
              >
                {processing ? <Loader2 className="animate-spin w-4 h-4" /> : "Validate & Progress"}
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 text-rose-600 border-border/50 hover:bg-rose-50 hover:border-rose-200 font-black uppercase tracking-widest rounded-xl transition-all text-xs"
                onClick={() => handleStatusChange("rejected")}
                disabled={processing}
              >
                {processing ? <Loader2 className="animate-spin w-4 h-4" /> : "Reject Proposal"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>

  );
}