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
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 dark:from-primary/30 dark:to-purple-500/30 blur-3xl animate-pulse" />
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
          <div className="relative bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 p-6 rounded-2xl border border-yellow-200/50 dark:border-yellow-800/50">
            <AlertTriangle className="w-16 h-16 text-yellow-600 dark:text-yellow-500 mx-auto" />
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-3 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
          Access Denied
        </h3>
        <p className="text-muted-foreground mb-8 text-lg">
          {errorMessage ||
            "This proposal may not exist, or you do not have permission to view it."}
        </p>

        <Card className="w-full bg-gradient-to-br from-muted/50 to-muted/30 dark:from-muted/20 dark:to-muted/10 border-muted-foreground/20">
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
          className="mt-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
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
    <div className="max-w-7xl mx-auto space-y-6 pb-12 px-4 sm:px-6">
      {/* Enhanced Top Navigation with Gradient */}
      <div className="flex items-center justify-between py-4 px-6 -mx-4 sm:-mx-6 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent dark:from-primary/10 dark:via-primary/5 dark:to-transparent rounded-2xl border border-primary/10 dark:border-primary/20">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2 hover:gap-3 transition-all duration-300 hover:bg-primary/10 dark:hover:bg-primary/20"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Back to Inbox</span>
        </Button>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              Submitted {format(new Date(proposal.created_at), "MMM d, yyyy")}
            </span>
          </div>
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
              Status:
            </span>
            <Badge
              variant="outline"
              className="capitalize text-sm py-1.5 px-4 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 border-primary/20 font-medium"
            >
              {proposal.status.replace(/_/g, " ")}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Enhanced Proposal Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-t-4 border-t-primary shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/95">
            {/* Header Section with Gradient */}
            <CardHeader className="bg-gradient-to-br from-primary/5 via-primary/3 to-transparent dark:from-primary/10 dark:via-primary/5 dark:to-transparent pb-6">
              <div className="flex justify-between items-start gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white hover:from-blue-600 hover:to-blue-700 border-0 shadow-md">
                      {proposal.category.replace(/_/g, " ")}
                    </Badge>
                    {proposal.department && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1.5 bg-background/50 dark:bg-background/30 backdrop-blur-sm"
                      >
                        <Building className="w-3.5 h-3.5" />
                        {proposal.department.name}
                      </Badge>
                    )}
                    {cycle && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {cycle.title}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl sm:text-3xl leading-tight font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {proposal.title}
                  </CardTitle>
                </div>
                <div className="text-right shrink-0 bg-gradient-to-br from-muted/50 to-muted/30 dark:from-muted/30 dark:to-muted/20 p-4 rounded-xl border border-muted-foreground/10">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Citizen Estimate
                  </p>
                  <p className="text-2xl font-bold font-mono bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                    NPR {proposal.estimated_cost.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Description Section */}
              <div className="prose dark:prose-invert max-w-none">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider m-0">
                    Description
                  </h3>
                </div>
                <div className="bg-gradient-to-br from-muted/30 to-muted/10 dark:from-muted/20 dark:to-muted/5 p-6 rounded-xl border border-muted-foreground/10">
                  <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground m-0">
                    {proposal.description}
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Details Grid with Enhanced Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-primary/5 to-primary/0 dark:from-primary/10 dark:to-primary/0 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Submitted By
                        </span>
                        <p className="font-semibold text-foreground">
                          {proposal.author?.full_name}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/0 dark:from-emerald-500/10 dark:to-emerald-500/0 border-emerald-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg">
                        <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Location
                        </span>
                        <p className="font-semibold text-foreground">
                          {proposal.address_text || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Enhanced Vetting Console */}
        <div className="space-y-6">
          {/* 1. Technical Assessment with Gradient */}
          <Card className="shadow-xl border-primary/30 dark:border-primary/50 bg-gradient-to-br from-card via-card to-primary/5 dark:to-primary/10">
            <CardHeader className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent pb-4 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-primary/20 dark:bg-primary/30 rounded-lg">
                  <Calculator className="w-5 h-5 text-primary" />
                </div>
                <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent font-bold">
                  Technical Vetting
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Cost Override with Enhanced Styling */}
              <div className="space-y-3">
                <label className="text-sm font-bold flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Official Cost Estimate
                  </span>
                  <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded">
                    NPR
                  </span>
                </label>
                <div className="relative group">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="number"
                    className="pl-10 pr-4 h-12 font-mono font-bold text-lg bg-gradient-to-br from-background to-muted/20 dark:from-background dark:to-muted/10 border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    value={technicalCost}
                    onChange={(e) => setTechnicalCost(Number(e.target.value))}
                    min={0}
                  />
                </div>

                {/* Cost Difference Indicator */}
                {costDifference !== 0 && (
                  <div
                    className={`flex items-center gap-2 text-xs p-3 rounded-lg ${
                      costDifference > 0
                        ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                        : "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium">
                      {costDifference > 0 ? "+" : ""}
                      {costDifference.toLocaleString()} NPR (
                      {costDifferencePercent}%{" "}
                      {costDifference > 0 ? "higher" : "lower"})
                    </span>
                  </div>
                )}

                <p className="text-xs text-muted-foreground bg-muted/50 dark:bg-muted/30 p-3 rounded-lg border border-muted-foreground/10">
                  💡 Update this if the citizen estimate is inaccurate based on
                  department standards.
                </p>
              </div>

              {/* Enhanced Impact Visualizer */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/30 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4 shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Budget Impact
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        isHighImpact
                          ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400"
                          : "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400"
                      }`}
                    >
                      {impactPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="relative h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full transition-all duration-700 ease-out relative ${
                      isHighImpact
                        ? "bg-gradient-to-r from-red-500 to-red-600"
                        : "bg-gradient-to-r from-green-500 to-emerald-600"
                    }`}
                    style={{ width: `${Math.min(impactPercentage, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                </div>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>NPR 0</span>
                  <span className="font-medium">
                    {cycle ? `${cycle.title} Budget` : "Cycle Budget"}: NPR{" "}
                    {(totalBudget / 100000).toFixed(1)}L
                  </span>
                </div>

                {isHighImpact && (
                  <div className="flex items-start gap-2 text-xs bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50 p-3 rounded-lg border border-red-200 dark:border-red-800">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-500 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-700 dark:text-red-400 mb-1">
                        Critical Budget Consumption
                      </p>
                      <p className="text-red-600 dark:text-red-500">
                        This proposal will consume {impactPercentage.toFixed(1)}
                        % of the total {cycle?.title || "cycle"} budget.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 2. Enhanced Decision & Communication */}
          <Card className="shadow-xl bg-gradient-to-br from-card to-card/95">
            <CardHeader className="pb-4 bg-gradient-to-br from-muted/30 to-transparent dark:from-muted/20 border-b">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <span className="font-bold">Decision & Notes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    Public Notes
                  </label>
                  <Select onValueChange={handleQuickNote}>
                    <SelectTrigger className="h-8 text-xs w-[150px] bg-gradient-to-r from-muted/50 to-muted/30 dark:from-muted/30 dark:to-muted/20 border-muted-foreground/20">
                      <SelectValue placeholder="📋 Quick Response" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Approved. Meets all technical criteria.">
                        ✅ Meets Criteria
                      </SelectItem>
                      <SelectItem value="Adjusted cost estimate to reflect market rates.">
                        💰 Cost Adjusted
                      </SelectItem>
                      <SelectItem value="Rejected. Land ownership dispute.">
                        🚫 Land Dispute
                      </SelectItem>
                      <SelectItem value="Rejected. Duplicate of existing project.">
                        📋 Duplicate
                      </SelectItem>
                      <SelectItem value="Rejected. Exceeds budget allocation.">
                        💸 Over Budget
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  placeholder="Provide detailed feedback for the citizen and other stakeholders..."
                  className="min-h-[140px] resize-none bg-gradient-to-br from-background to-muted/10 dark:from-background dark:to-muted/5 border-2 border-muted-foreground/10 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  💡 This note will be visible to the citizen and other
                  stakeholders
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-0 pb-6">
              <Button
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-12 font-semibold"
                size="lg"
                onClick={() => handleStatusChange("approved_for_voting")}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Approve for Voting
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border-2 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 transition-all duration-300 h-12 font-semibold"
                onClick={() => handleStatusChange("rejected")}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Processing...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Reject Proposal
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}