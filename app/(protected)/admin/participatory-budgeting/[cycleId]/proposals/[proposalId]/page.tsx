"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { 
  ArrowLeft, MapPin, Calendar, User, Building, 
  ThumbsUp, DollarSign, CheckCircle2, XCircle, 
  AlertTriangle, Save, Loader2, FileText, Send,
  RefreshCw
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { pbService, type BudgetProposal } from "@/lib/supabase/queries/participatory-budgeting";

export default function AdminProposalDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.proposalId as string;
  const cycleId = params.cycleId as string;

  const [proposal, setProposal] = useState<BudgetProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [adminNotes, setAdminNotes] = useState("");
  const [technicalCost, setTechnicalCost] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    if (proposalId && cycleId) {
      loadProposal();
    } else {
      setError("Missing proposal ID or cycle ID");
      setLoading(false);
    }
  }, [proposalId, cycleId]);

  const loadProposal = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("🔍 Loading proposal:", proposalId);
      console.log("📊 For cycle:", cycleId);

      // Try the admin-specific method first
      let data: BudgetProposal | null = null;
      
      try {
        data = await pbService.getProposalDetailsForAdmin(proposalId);
        console.log("✅ Loaded via getProposalDetailsForAdmin");
      } catch (adminError) {
        console.warn("⚠️ getProposalDetailsForAdmin failed, trying alternative method:", adminError);
        
        // Fallback: Try getting all proposals and find this one
        try {
          const allProposals = await pbService.getProposals(cycleId, null);
          data = allProposals.find((p: BudgetProposal) => p.id === proposalId) || null;
          console.log("✅ Loaded via getProposals fallback");
        } catch (fallbackError) {
          console.error("❌ Fallback also failed:", fallbackError);
          throw new Error("Could not load proposal data");
        }
      }

      if (!data) {
        throw new Error("Proposal not found");
      }

      console.log("✅ Proposal loaded:", data.title);
      setProposal(data);
      setAdminNotes(data.admin_notes || "");
      setTechnicalCost(data.technical_cost?.toString() || data.estimated_cost.toString());
      setStatus(data.status);
      
    } catch (error: any) {
      console.error("❌ Error loading proposal:", error);
      const errorMessage = error?.message || "Failed to load proposal details";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!proposal) return;
    
    setSaving(true);
    try {
      console.log("💾 Saving changes to proposal:", proposalId);
      
      await pbService.updateProposalStatus(
        proposalId, 
        status as any, 
        adminNotes, 
        parseFloat(technicalCost) || proposal.estimated_cost
      );
      
      toast.success("✅ Proposal updated successfully");
      
      // Reload to get fresh data
      await loadProposal();
      
    } catch (error: any) {
      console.error("❌ Error saving proposal:", error);
      toast.error(error?.message || "Failed to update proposal");
    } finally {
      setSaving(false);
    }
  };

  const handleGoBack = () => {
    // Navigate back to analytics page of the cycle
    if (cycleId) {
      router.push(`/admin/participatory-budgeting/${cycleId}/analytics`);
    } else {
      router.back();
    }
  };

  const handleRetry = () => {
    loadProposal();
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 dark:from-primary/30 dark:to-purple-500/30 blur-3xl animate-pulse" />
          <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10" />
        </div>
        <p className="text-base text-muted-foreground font-medium animate-pulse">
          Loading proposal details...
        </p>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="container mx-auto py-8 max-w-4xl px-4">
        <Button 
          variant="ghost" 
          onClick={handleGoBack} 
          className="mb-6 pl-0 hover:pl-2 transition-all duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Analytics
        </Button>

        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error:</strong> {error || "Proposal not found"}
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Proposal Not Found</CardTitle>
            <CardDescription>
              Unable to load the proposal details. This could be due to:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>The proposal ID is invalid or incorrect</li>
              <li>You don't have permission to view this proposal</li>
              <li>The proposal has been deleted</li>
              <li>Database connection issue</li>
            </ul>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleRetry} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={handleGoBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Analytics
              </Button>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-xs font-mono text-muted-foreground">
                Debug Info:
              </p>
              <div className="text-xs font-mono text-muted-foreground space-y-1 mt-2">
                <div>Proposal ID: {proposalId || 'N/A'}</div>
                <div>Cycle ID: {cycleId || 'N/A'}</div>
                <div>Error: {error || 'Unknown'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl px-4 space-y-6">
      {/* Header & Navigation */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={handleGoBack} 
          className="pl-0 hover:pl-2 transition-all duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Analytics
        </Button>
        <div className="flex gap-2">
          {proposal.status === 'submitted' && (
            <>
              <Button 
                variant="destructive" 
                onClick={() => { setStatus('rejected'); handleSaveChanges(); }}
                disabled={saving}
              >
                <XCircle className="w-4 h-4 mr-2" /> Reject
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => { setStatus('approved_for_voting'); handleSaveChanges(); }}
                disabled={saving}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Approve for Voting
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Proposal Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg border-t-4 border-t-primary">
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <Badge variant="outline" className="mb-2 capitalize">
                    {proposal.category.replace(/_/g, " ")}
                  </Badge>
                  <CardTitle className="text-2xl font-bold leading-tight">
                    {proposal.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <Calendar className="w-4 h-4" />
                    Submitted on {format(new Date(proposal.created_at), "PPP 'at' p")}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <Badge 
                    className={`
                      ${proposal.status === 'approved_for_voting' ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-950 dark:text-green-400' : ''}
                      ${proposal.status === 'rejected' ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950 dark:text-red-400' : ''}
                      ${proposal.status === 'submitted' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-950 dark:text-yellow-400' : ''}
                      capitalize text-sm px-3 py-1
                    `}
                  >
                    {proposal.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {proposal.cover_image_url && (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border">
                  <img 
                    src={proposal.cover_image_url} 
                    alt="Proposal cover" 
                    className="object-cover w-full h-full"
                  />
                </div>
              )}

              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Description
                </h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {proposal.description}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Location
                  </h3>
                  <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-1">
                    <p><span className="font-medium">Address:</span> {proposal.address_text || "No address provided"}</p>
                    <p><span className="font-medium">Ward:</span> {(proposal as any).ward_number ? `Ward ${(proposal as any).ward_number}` : "Unassigned"}</p>
                    {proposal.location_point && (
                      <p className="text-xs text-muted-foreground mt-2 font-mono">
                        GIS: {JSON.stringify(proposal.location_point)}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Author Details
                  </h3>
                  <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-1">
                    <p><span className="font-medium">Name:</span> {proposal.author?.full_name || "Unknown"}</p>
                    <p><span className="font-medium">Email:</span> {proposal.author?.email || "N/A"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Admin Controls */}
        <div className="space-y-6">
          {/* Stats Card */}
          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                    <ThumbsUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium">Total Votes</span>
                </div>
                <span className="text-xl font-bold">{proposal.vote_count || 0}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                    <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-medium">Est. Cost</span>
                </div>
                <span className="font-bold">NPR {proposal.estimated_cost.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Admin Actions Card */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Admin Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="status">Proposal Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved_for_voting">Approved for Voting</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="selected">Selected (Winner)</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tech-cost">Verified Technical Cost (NPR)</Label>
                <Input 
                  id="tech-cost"
                  type="number" 
                  value={technicalCost}
                  onChange={(e) => setTechnicalCost(e.target.value)}
                  className="font-mono"
                  placeholder="Enter validated cost"
                />
                <p className="text-xs text-muted-foreground">This value overrides the user's estimate.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Assigned Department</Label>
                <div className="p-3 bg-muted rounded-md text-sm flex items-center gap-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  {proposal.department?.name || "Unassigned"}
                </div>
                <p className="text-xs text-muted-foreground">Department is auto-assigned based on category.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Admin Internal Notes</Label>
                <Textarea 
                  id="notes"
                  placeholder="Add notes about feasibility, budget checks, etc."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <Button 
                className="w-full mt-4" 
                onClick={handleSaveChanges} 
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Proposal
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}