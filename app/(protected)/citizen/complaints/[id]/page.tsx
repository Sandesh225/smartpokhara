"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { format, formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Construction,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Lightbulb,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Printer,
  RefreshCw,
  Share2,
  Shield,
  ThumbsUp,
  Trash2,
  Trees,
  User,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// Custom Components
import { CommentThread } from "@/components/citizen/complaints/CommentThread";
import { FeedbackForm } from "@/components/citizen/complaints/FeedbackForm";

// Leaflet Dynamic Import (Disables SSR for Window Object)
const ComplaintMap = dynamic(() => import("@/components/maps/ComplaintMap"), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 text-xs">Loading City Map...</div>
});

// Services & Types
import { complaintsService } from "@/lib/supabase/queries/complaints";
import type { ComplaintComment, ComplaintStatusHistory } from "@/lib/supabase/queries/complaints";

// ----------------------------------------------------------------------
// CONSTANTS & HELPERS
// ----------------------------------------------------------------------

const PROGRESS_STEPS = [
  { id: "received", label: "Received" },
  { id: "assigned", label: "Assigned" },
  { id: "in_progress", label: "In Progress" },
  { id: "resolved", label: "Resolved" },
];

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const getStepIndex = (status: string) => {
  if (status === "closed" || status === "resolved") return 3;
  if (status === "in_progress" || status === "reopened") return 2;
  if (status === "assigned") return 1;
  return 0;
};

const getCategoryIcon = (name: string | null | undefined) => {
  const lower = (name || "").toLowerCase();
  if (lower.includes("water")) return <Droplets className="h-6 w-6" />;
  if (lower.includes("electric") || lower.includes("light")) return <Lightbulb className="h-6 w-6" />;
  if (lower.includes("waste") || lower.includes("trash")) return <Trash2 className="h-6 w-6" />;
  if (lower.includes("road")) return <Construction className="h-6 w-6" />;
  if (lower.includes("tree") || lower.includes("park")) return <Trees className="h-6 w-6" />;
  if (lower.includes("noise")) return <Volume2 className="h-6 w-6" />;
  return <FileText className="h-6 w-6" />;
};

const getStatusPill = (status: string) => {
  switch (status) {
    case "resolved": return "border-green-300 bg-green-50 text-green-700";
    case "closed": return "border-slate-300 bg-slate-50 text-slate-700";
    case "rejected": return "border-red-300 bg-red-50 text-red-700";
    case "in_progress": return "border-blue-300 bg-blue-50 text-blue-700";
    default: return "border-amber-300 bg-amber-50 text-amber-700";
  }
};

// ----------------------------------------------------------------------
// MAIN PAGE
// ----------------------------------------------------------------------

export default function ComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const complaintId = params.id as string;

  // States
  const [complaint, setComplaint] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<ComplaintComment[]>([]);
  const [statusHistory, setStatusHistory] = useState<ComplaintStatusHistory[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeTab, setActiveTab] = useState("comments");

  const subsRef = useRef<any[]>([]);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (!complaintId) return;
      await fetchComplaintData();
      if (mounted) setupSubscriptions();
    };
    init();
    return () => {
      mounted = false;
      cleanupSubscriptions();
    };
  }, [complaintId]);

  const cleanupSubscriptions = () => {
    subsRef.current.forEach((sub) => sub.unsubscribe());
    subsRef.current = [];
    setIsSubscribed(false);
  };

  const fetchComplaintData = async (isBackgroundRefresh = false) => {
    if (!isBackgroundRefresh) setIsLoading(true);
    try {
      const canView = await complaintsService.canViewComplaint(complaintId);
      if (!canView) {
        toast.error("Access Denied");
        router.push("/citizen/complaints");
        return;
      }
      const data = await complaintsService.getComplaintById(complaintId);
      if (!data) throw new Error("Complaint not found");

      setComplaint(data);
      setComments(data.comments || []);
      setStatusHistory(data.status_history || []);
      setAttachments(data.attachments || []);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      if (!isBackgroundRefresh) setIsLoading(false);
    }
  };

  const setupSubscriptions = () => {
    cleanupSubscriptions();

    // Sub 1: Complaints Table (Triggers re-fetch to maintain Joined Data integrity)
    const sub1 = complaintsService.subscribeToComplaint(complaintId, (payload) => {
      if (payload.eventType === "UPDATE") {
        fetchComplaintData(true);
        if (payload.new.status !== payload.old?.status) {
          toast.info("Status Updated", {
            description: `Now: ${payload.new.status.replace("_", " ")}`,
            icon: <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />,
          });
        }
      }
    });

    // Sub 2: Real-time Comments
    const sub2 = complaintsService.subscribeToComments(complaintId, (payload) => {
      if (payload.eventType === "INSERT") {
        setComments((prev) => prev.some(c => c.id === payload.new.id) ? prev : [...prev, payload.new]);
      }
    });

    subsRef.current = [sub1, sub2];
    setIsSubscribed(true);
  };

  // UI Actions
  const handleCopyCode = () => {
    navigator.clipboard.writeText(complaint.tracking_code);
    toast.success("Tracking code copied");
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: `Complaint #${complaint.tracking_code}`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  if (isLoading) return <ComplaintSkeleton />;
  if (error || !complaint) return <ComplaintError error={error} router={router} />;

  // Computed Values
  const isResolved = ["resolved", "closed"].includes(complaint.status);
  const activeStep = getStepIndex(complaint.status);
  const progressPct = (activeStep / (PROGRESS_STEPS.length - 1)) * 100;

  const submitted = new Date(complaint.submitted_at).getTime();
  const due = complaint.sla_due_at ? new Date(complaint.sla_due_at).getTime() : submitted + 3 * 86400000;
  const resolutionTime = isResolved ? new Date(complaint.resolved_at || complaint.updated_at).getTime() : Date.now();
  const slaProgress = clamp(((resolutionTime - submitted) / (due - submitted)) * 100, 0, 100);
  const isOverdue = Date.now() > due && !isResolved;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-12">
      {/* 1. STICKY HEADER */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b-2 border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => router.push("/citizen/complaints")} className="rounded-xl border-2">
              <ArrowLeft className="h-5 w-5 text-slate-700" />
            </Button>
            <div>
              <h1 className="text-sm md:text-base font-bold text-slate-900 truncate max-w-[200px] md:max-w-md">{complaint.title}</h1>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                <span>#{complaint.tracking_code}</span>
                <button onClick={handleCopyCode} className="hover:text-blue-600"><Copy className="h-3 w-3" /></button>
                <span className="text-slate-300">|</span>
                <span>Updated {formatDistanceToNow(new Date(complaint.updated_at))} ago</span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex gap-2">
            <Button variant="outline" onClick={() => fetchComplaintData()} className="rounded-xl border-2 bg-white">
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} /> Refresh
            </Button>
            <Button variant="outline" onClick={handleShare} className="rounded-xl border-2 bg-white">
              <Share2 className="h-4 w-4 mr-2" /> Share
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* 2. PROGRESS TRACKER */}
        <Card className="border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Current Status</p>
                <Badge className={cn("mt-1 px-4 py-1 rounded-full border-2 capitalize text-xs", getStatusPill(complaint.status))}>
                  {complaint.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Priority</p>
                <Badge variant="outline" className="mt-1 border-2 rounded-full capitalize">{complaint.priority}</Badge>
              </div>
            </div>

            <div className="relative px-2">
              <div className="absolute top-1/2 left-0 w-full h-1.5 bg-slate-100 -translate-y-1/2 rounded-full" />
              <div 
                className="absolute top-1/2 left-0 h-1.5 bg-blue-600 -translate-y-1/2 rounded-full transition-all duration-1000" 
                style={{ width: `${progressPct}%` }} 
              />
              <div className="relative flex justify-between">
                {PROGRESS_STEPS.map((step, idx) => (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={cn(
                      "w-8 h-8 rounded-full border-4 flex items-center justify-center bg-white transition-colors z-10",
                      idx <= activeStep ? "border-blue-600 text-blue-600" : "border-slate-200 text-slate-300"
                    )}>
                      {idx < activeStep ? <Check className="h-4 w-4" /> : <div className={cn("w-2 h-2 rounded-full", idx === activeStep ? "bg-blue-600 animate-pulse" : "bg-slate-200")} />}
                    </div>
                    <span className={cn("mt-2 text-[10px] font-bold uppercase", idx <= activeStep ? "text-slate-900" : "text-slate-400")}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Details Card */}
            <Card className="border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center gap-4 bg-slate-50/50 border-b-2 border-slate-100">
                <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                  {getCategoryIcon(complaint.category?.name)}
                </div>
                <div>
                  <CardTitle className="text-lg">{complaint.category?.name}</CardTitle>
                  <CardDescription className="text-xs">{complaint.subcategory?.name || "General Inquiry"}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-slate-50 rounded-2xl p-5 border-2 border-slate-100">
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
                </div>
                
                {attachments.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                      <Paperclip className="h-3 w-3" /> Attached Evidence
                    </h4>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {attachments.map((file, i) => (
                        <div key={i} className="shrink-0 w-24 h-24 rounded-xl border-2 border-slate-200 overflow-hidden bg-white hover:border-blue-400 transition-colors cursor-pointer group">
                          <img src={file.file_path} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Discussion & Timeline Tabs */}
            <Card className="border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-6 pt-2 border-b-2 border-slate-100 bg-white">
                  <TabsList className="bg-transparent h-12 gap-6">
                    <TabsTrigger value="comments" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 bg-transparent px-0 font-bold text-xs uppercase tracking-wider">
                      <MessageSquare className="h-4 w-4 mr-2" /> Discussion
                    </TabsTrigger>
                    <TabsTrigger value="timeline" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 bg-transparent px-0 font-bold text-xs uppercase tracking-wider">
                      <Clock className="h-4 w-4 mr-2" /> History
                    </TabsTrigger>
                    {isResolved && (
                      <TabsTrigger value="feedback" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 bg-transparent px-0 font-bold text-xs uppercase tracking-wider">
                        <ThumbsUp className="h-4 w-4 mr-2" /> Rate Service
                      </TabsTrigger>
                    )}
                  </TabsList>
                </div>

                <div className="p-6">
                  <TabsContent value="comments" className="m-0 focus-visible:outline-none">
                    <CommentThread complaintId={complaintId} comments={comments} isSubscribed={isSubscribed} onNewComment={(c) => setComments(prev => [...prev, c])} />
                  </TabsContent>
                  <TabsContent value="timeline" className="m-0 focus-visible:outline-none">
                    <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pl-8 py-4">
                      {statusHistory.map((h, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-white bg-blue-500 shadow-sm" />
                          <div>
                            <p className="text-sm font-bold text-slate-900 capitalize">{h.new_status.replace("_", " ")}</p>
                            <p className="text-[10px] text-slate-500 mb-2">{format(new Date(h.created_at), "PPP p")}</p>
                            {h.note && <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl italic border border-slate-200">"{h.note}"</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="feedback" className="m-0 focus-visible:outline-none">
                    <FeedbackForm complaintId={complaintId} complaintStatus={complaint.status} onSubmitSuccess={() => fetchComplaintData(true)} />
                  </TabsContent>
                </div>
              </Tabs>
            </Card>
          </div>

          {/* 4. SIDEBAR */}
          <div className="space-y-6">
            
            {/* SLA Card */}
            <Card className="border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className={cn("h-1.5", isResolved ? "bg-green-500" : isOverdue ? "bg-red-500" : "bg-blue-600")} />
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Resolution Target</span>
                  {isOverdue && <Badge variant="destructive" className="text-[9px] h-5 rounded-full">Delayed</Badge>}
                </div>
                <div className="text-2xl font-black text-slate-900 mb-1">
                  {isResolved ? "Resolved" : isOverdue ? "SLA Overdue" : format(due, "MMM d, yyyy")}
                </div>
                <p className="text-[10px] text-slate-500 mb-6">Target response time: {complaint.category?.default_sla_days || 7} days</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-500 uppercase">Efficiency</span>
                    <span className="text-slate-900">{slaProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={slaProgress} className="h-2 rounded-full bg-slate-100" />
                </div>
              </CardContent>
            </Card>

            {/* Map Card */}
            <Card className="border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <CardHeader className="py-3 border-b-2 border-slate-100 bg-slate-50/50">
                <CardTitle className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Location
                </CardTitle>
              </CardHeader>
              <div className="h-48 relative">
                <ComplaintMap lat={complaint.latitude || 28.2096} lng={complaint.longitude || 83.9856} />
                <div className="absolute bottom-3 right-3 z-[1000]">
                  <Button size="sm" onClick={() => window.open(`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`)} className="rounded-xl shadow-xl bg-white text-slate-900 border-2 border-slate-200 hover:bg-slate-50 px-3 h-8 text-[10px] font-bold">
                    <ExternalLink className="h-3 w-3 mr-2" /> Directions
                  </Button>
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex gap-3">
                  <Building2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Ward {complaint.ward?.ward_number || "N/A"}</p>
                    <p className="text-[10px] text-slate-500">{complaint.address_text}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assignment Card */}
            <Card className="border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <CardHeader className="py-3 border-b-2 border-slate-100 bg-slate-50/50">
                <CardTitle className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Office Assigned
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Department</p>
                <p className="text-xs font-bold text-slate-900 mb-4">{complaint.department?.name || "Processing..."}</p>
                
                {complaint.staff ? (
                  <div className="flex items-center gap-3 p-3 rounded-2xl border-2 border-blue-50 bg-blue-50/30">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                      <AvatarImage src={complaint.staff.profile?.profile_photo_url} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-xs"><User /></AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{complaint.staff.profile?.full_name}</p>
                      <p className="text-[10px] text-slate-500 capitalize">{complaint.staff.staff_role.replace("_", " ")}</p>
                    </div>
                  </div>
                ) : (
                  <Alert className="bg-amber-50 border-amber-100 py-2 rounded-xl">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-[10px] text-amber-700">Waiting for staff assignment...</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 5. MOBILE BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur border-t-2 border-slate-200 flex items-center justify-around px-4 md:hidden z-50">
        <Button variant="ghost" className={cn("flex flex-col h-auto py-1 gap-1", activeTab === "comments" && "text-blue-600")} onClick={() => setActiveTab("comments")}>
          <MessageSquare className="h-5 w-5" />
          <span className="text-[10px] font-bold">Comment</span>
        </Button>
        <Button variant="ghost" className={cn("flex flex-col h-auto py-1 gap-1", activeTab === "timeline" && "text-blue-600")} onClick={() => setActiveTab("timeline")}>
          <Clock className="h-5 w-5" />
          <span className="text-[10px] font-bold">Status</span>
        </Button>
        {isResolved ? (
          <Button variant="ghost" className={cn("flex flex-col h-auto py-1 gap-1", activeTab === "feedback" && "text-blue-600")} onClick={() => setActiveTab("feedback")}>
            <ThumbsUp className="h-5 w-5" />
            <span className="text-[10px] font-bold">Rate</span>
          </Button>
        ) : (
          <Button variant="ghost" className="flex flex-col h-auto py-1 gap-1" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
            <span className="text-[10px] font-bold">Share</span>
          </Button>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// SKELETON & ERROR COMPONENTS
// ----------------------------------------------------------------------

function ComplaintSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <Skeleton className="h-10 w-48 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    </div>
  );
}

function ComplaintError({ error, router }: { error: string | null; router: any }) {
  return (
    <div className="flex h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-red-100 rounded-3xl overflow-hidden shadow-2xl">
        <div className="h-2 bg-red-500" />
        <CardHeader className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <CardTitle>Error Loading Data</CardTitle>
          <CardDescription>{error || "We couldn't find the record you requested."}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-8 gap-4">
          <Button variant="outline" onClick={() => router.back()} className="rounded-xl border-2">Go Back</Button>
          <Button onClick={() => window.location.reload()} className="rounded-xl bg-blue-600">Try Again</Button>
        </CardContent>
      </Card>
    </div>
  );
}