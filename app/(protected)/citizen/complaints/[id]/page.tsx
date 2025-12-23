"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
  Droplets,
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
  ShieldCheck,
  Zap,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

// Custom Components
import { CommentThread } from "@/components/citizen/complaints/CommentThread";
import { FeedbackForm } from "@/components/citizen/complaints/FeedbackForm";

// No-SSR Map Import
const ComplaintMap = dynamic(() => import("@/components/map/ComplaintMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 text-xs font-black uppercase tracking-widest">
      Initialising Map Registry...
    </div>
  ),
});

import { complaintsService } from "@/lib/supabase/queries/complaints";
import type {
  ComplaintComment,
  ComplaintStatusHistory,
} from "@/lib/supabase/queries/complaints";
import { motion } from "framer-motion";

// ----------------------------------------------------------------------
// CONSTANTS & LOGIC
// ----------------------------------------------------------------------

const PROGRESS_STEPS = [
  { id: "received", label: "Received" },
  { id: "assigned", label: "Assigned" },
  { id: "in_progress", label: "Resolving" },
  { id: "resolved", label: "Completed" },
];

const getStepIndex = (status: string) => {
  if (status === "closed" || status === "resolved") return 3;
  if (status === "in_progress" || status === "reopened") return 2;
  if (status === "assigned" || status === "under_review") return 1;
  return 0;
};

const getStatusTheme = (status: string) => {
  switch (status) {
    case "resolved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "closed":
      return "bg-slate-50 text-slate-600 border-slate-200";
    case "rejected":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "in_progress":
      return "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
};

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

export default function ComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const complaintId = params.id as string;

  const [complaint, setComplaint] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [comments, setComments] = useState<ComplaintComment[]>([]);
  const [statusHistory, setStatusHistory] = useState<ComplaintStatusHistory[]>(
    []
  );
  const [activeTab, setActiveTab] = useState("comments");

  const subsRef = useRef<any[]>([]);

  // 1. Data Fetcher
  const loadComplaintData = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setIsLoading(true);
      else setIsRefreshing(true);

      try {
        const data = await complaintsService.getComplaintById(complaintId);
        if (!data) throw new Error("Entry not found");

        setComplaint(data);
        setComments(data.comments || []);
        setStatusHistory(data.status_history || []);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [complaintId]
  );

  // 2. Real-time Subscription Setup
  useEffect(() => {
    loadComplaintData();

    const sub1 = complaintsService.subscribeToComplaint(
      complaintId,
      (payload) => {
        if (payload.eventType === "UPDATE") {
          // Re-fetch to preserve nested Ward/Staff objects missing from raw payload
          loadComplaintData(true);
          toast.info("Status Update Detected");
        }
      }
    );

    const sub2 = complaintsService.subscribeToComments(
      complaintId,
      (payload) => {
        if (payload.eventType === "INSERT") {
          setComments((prev) =>
            prev.some((c) => c.id === payload.new.id)
              ? prev
              : [...prev, payload.new]
          );
        }
      }
    );

    subsRef.current = [sub1, sub2];
    return () => subsRef.current.forEach((s) => s.unsubscribe());
  }, [complaintId, loadComplaintData]);

  // 3. Computed Logic
  const computed = useMemo(() => {
    if (!complaint) return null;

    const isResolved = ["resolved", "closed"].includes(complaint.status);
    const submitted = new Date(complaint.submitted_at).getTime();
    const due = complaint.sla_due_at
      ? new Date(complaint.sla_due_at).getTime()
      : submitted + 7 * 86400000;
    const resolvedAt = isResolved
      ? new Date(complaint.resolved_at || complaint.updated_at).getTime()
      : Date.now();

    const slaProgress = Math.min(
      Math.max(((resolvedAt - submitted) / (due - submitted)) * 100, 0),
      100
    );
    const isOverdue = Date.now() > due && !isResolved;

    return { isResolved, isOverdue, slaProgress, due };
  }, [complaint]);

  if (isLoading) return <DetailSkeleton />;
  if (!complaint)
    return (
      <div className="p-20 text-center font-black">
        REGISTRY ERROR: DATA MISSING
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* STICKY HEADER */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b-2 border-slate-100">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/citizen/complaints")}
              className="rounded-2xl border-2 hover:bg-slate-50"
            >
              <ArrowLeft className="h-5 w-5 text-slate-900" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-xl font-black text-slate-900 leading-none truncate max-w-md">
                {complaint.title}
              </h1>
              <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-900">
                  #{complaint.tracking_code}
                </span>
                <span>
                  Updated {formatDistanceToNow(new Date(complaint.updated_at))}{" "}
                  ago
                </span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex gap-3">
            <Button
              variant="outline"
              onClick={() => loadComplaintData(true)}
              className="rounded-2xl border-2 bg-white"
            >
              <RefreshCw
                className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")}
              />{" "}
              Sync Registry
            </Button>
            <Button
              onClick={() => window.print()}
              className="rounded-2xl bg-slate-900 text-white font-black hover:bg-black"
            >
              <Printer className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10 space-y-10 max-w-7xl">
        {/* PROGRESS TRACKER */}
        <Card className="border-0 shadow-2xl rounded-[2.5rem] bg-white ring-1 ring-slate-200 overflow-hidden">
          <CardContent className="p-10">
            <div className="flex items-center justify-between mb-12">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                  Operational Status
                </p>
                <Badge
                  className={cn(
                    "px-6 py-2 rounded-2xl border-2 text-xs font-black uppercase shadow-sm",
                    getStatusTheme(complaint.status)
                  )}
                >
                  {complaint.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="text-right space-y-2">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                  Priority
                </p>
                <Badge
                  variant="outline"
                  className="border-2 rounded-2xl px-6 py-2 font-black uppercase text-xs"
                >
                  {complaint.priority}
                </Badge>
              </div>
            </div>

            <div className="relative pt-2 px-4">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full" />
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(getStepIndex(complaint.status) / 3) * 100}%`,
                }}
                className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"
              />
              <div className="relative flex justify-between">
                {PROGRESS_STEPS.map((step, idx) => {
                  const currentIdx = getStepIndex(complaint.status);
                  const isPast = idx < currentIdx;
                  const isCurrent = idx === currentIdx;
                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-2xl border-4 flex items-center justify-center bg-white transition-all duration-500 z-10 shadow-sm",
                          isPast
                            ? "border-blue-600 text-blue-600"
                            : isCurrent
                              ? "border-blue-600 bg-blue-600 text-white scale-125 shadow-xl"
                              : "border-slate-100 text-slate-300"
                        )}
                      >
                        {isPast ? (
                          <Check className="h-5 w-5" />
                        ) : isCurrent ? (
                          <Zap className="h-5 w-5 animate-pulse" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-200" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "mt-4 text-[10px] font-black uppercase tracking-widest transition-colors",
                          isPast || isCurrent
                            ? "text-slate-900"
                            : "text-slate-300"
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT: COMPLAINT DETAILS */}
          <div className="lg:col-span-2 space-y-10">
            <Card className="border-0 shadow-2xl rounded-[2.5rem] bg-white ring-1 ring-slate-200 overflow-hidden">
              <CardHeader className="bg-slate-50/50 p-10 border-b border-slate-100">
                <CardTitle className="text-3xl font-black text-slate-900">
                  Application Overview
                </CardTitle>
                <CardDescription className="text-lg font-medium text-slate-500">
                  Official registry entry details and documentation.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-[2rem] bg-slate-50 border-2 border-slate-100 space-y-3">
                    <div className="flex items-center gap-3 text-blue-600">
                      <FileText className="h-5 w-5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Primary Category
                      </span>
                    </div>
                    <p className="text-xl font-bold text-slate-900">
                      {complaint.category?.name}
                    </p>
                  </div>
                  <div className="p-6 rounded-[2rem] bg-slate-50 border-2 border-slate-100 space-y-3">
                    <div className="flex items-center gap-3 text-indigo-600">
                      <Building2 className="h-5 w-5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Assigned Dept
                      </span>
                    </div>
                    <p className="text-xl font-bold text-slate-900">
                      {complaint.department?.name || "Processing..."}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Statement of Issue
                  </h4>
                  <p className="text-lg text-slate-700 leading-relaxed font-medium bg-white p-2">
                    {complaint.description}
                  </p>
                </div>

                {complaint.attachments?.length > 0 && (
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Paperclip className="h-4 w-4" /> Evidence Registry
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {complaint.attachments.map((file: any, i: number) => (
                        <div
                          key={i}
                          className="aspect-square rounded-3xl border-2 border-slate-100 overflow-hidden hover:border-blue-400 transition-all cursor-pointer group shadow-sm"
                        >
                          <img
                            src={file.file_path}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* INTERACTION TABS */}
            <Card className="border-0 shadow-2xl rounded-[3rem] bg-white ring-1 ring-slate-200 overflow-hidden">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="bg-slate-100/50 p-2 h-auto border-b border-slate-100 w-full justify-start rounded-none">
                  <TabsTrigger
                    value="comments"
                    className="rounded-2xl px-8 py-3 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" /> Communication
                  </TabsTrigger>
                  <TabsTrigger
                    value="timeline"
                    className="rounded-2xl px-8 py-3 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all"
                  >
                    <Clock className="h-4 w-4 mr-2" /> History
                  </TabsTrigger>
                </TabsList>
                <div className="p-10">
                  <TabsContent value="comments" className="m-0 outline-none">
                    <CommentThread
                      complaintId={complaintId}
                      comments={comments}
                      isSubscribed={true}
                      onNewComment={(c) => setComments((p) => [...p, c])}
                    />
                  </TabsContent>
                  <TabsContent value="timeline" className="m-0 outline-none">
                    <div className="relative border-l-4 border-slate-100 ml-6 space-y-10 pl-10 py-4">
                      {statusHistory.map((h, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[54px] top-0 w-8 h-8 rounded-2xl bg-white border-4 border-slate-100 flex items-center justify-center text-blue-600 shadow-sm">
                            <Activity className="h-3 w-3" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-lg font-black text-slate-900 capitalize">
                              {h.new_status.replace("_", " ")}
                            </p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                              {format(new Date(h.created_at), "PPP p")}
                            </p>
                            {h.note && (
                              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 italic font-medium">
                                "{h.note}"
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </Card>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-10">
            {/* SLA EFFICIENCY */}
            <Card className="border-0 shadow-2xl rounded-[2.5rem] bg-white ring-1 ring-slate-900/5 overflow-hidden">
              <div
                className={cn(
                  "h-2",
                  computed?.isResolved
                    ? "bg-emerald-500"
                    : computed?.isOverdue
                      ? "bg-red-500"
                      : "bg-blue-600"
                )}
              />
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Resolution Deadline
                  </span>
                  {computed?.isOverdue && (
                    <Badge
                      variant="destructive"
                      className="animate-pulse font-black text-[9px] h-5 rounded-lg"
                    >
                      Overdue
                    </Badge>
                  )}
                </div>
                <div className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums">
                  {computed?.isResolved
                    ? "Complete"
                    : format(computed!.due, "MMM d, yyyy")}
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                    <span>Performance</span>
                    <span>{computed?.slaProgress.toFixed(0)}%</span>
                  </div>
                  <Progress
                    value={computed?.slaProgress}
                    className="h-3 rounded-full bg-slate-100 shadow-inner"
                  />
                </div>
              </CardContent>
            </Card>

            {/* MAP CARD */}
            <Card className="border-0 shadow-2xl rounded-[2.5rem] bg-white ring-1 ring-slate-900/5 overflow-hidden">
              <CardHeader className="bg-slate-50/50 p-6 border-b border-slate-100">
                <CardTitle className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Geographical Registry
                </CardTitle>
              </CardHeader>
              <div className="h-56 relative bg-slate-100">
                <ComplaintMap
                  lat={complaint.latitude || 28.2096}
                  lng={complaint.longitude || 83.9856}
                />
                <div className="absolute bottom-4 right-4 z-[1000]">
                  <Button
                    size="sm"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`,
                        "_blank"
                      )
                    }
                    className="rounded-xl shadow-2xl bg-white text-slate-900 border-2 border-slate-200 font-black text-[10px] h-10 px-5 hover:bg-slate-50"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" /> Directions
                  </Button>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900 leading-tight">
                      Ward {complaint.ward?.ward_number}
                    </p>
                    <p className="text-xs font-medium text-slate-500 mt-1">
                      {complaint.address_text}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ASSIGNMENT CARD */}
            <Card className="border-0 shadow-2xl rounded-[2.5rem] bg-white ring-1 ring-slate-900/5 overflow-hidden">
              <CardHeader className="bg-slate-50/50 p-6 border-b border-slate-100">
                <CardTitle className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Assigned Personnel
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {complaint.staff ? (
                  <div className="flex items-center gap-5">
                    <Avatar className="h-16 w-16 border-4 border-slate-50 shadow-lg ring-2 ring-blue-100">
                      <AvatarImage
                        src={complaint.staff.profile?.profile_photo_url}
                      />
                      <AvatarFallback className="bg-blue-600 text-white font-black text-lg">
                        {complaint.staff.profile?.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-lg font-black text-slate-900 leading-none truncate">
                        {complaint.staff.profile?.full_name}
                      </p>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2 block">
                        {complaint.staff.staff_role.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center p-4 space-y-4">
                    <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                      <Clock className="h-6 w-6 animate-pulse" />
                    </div>
                    <p className="text-xs font-bold text-slate-500">
                      Waiting for Metropolitan Staff assignment.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

// --- SKELETON UI ---

function DetailSkeleton() {
  return (
    <div className="container mx-auto px-6 py-10 space-y-10 animate-pulse">
      <Skeleton className="h-10 w-64 rounded-xl" />
      <Skeleton className="h-48 w-full rounded-[2.5rem]" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <Skeleton className="h-[500px] w-full rounded-[3rem]" />
        </div>
        <div className="space-y-10">
          <Skeleton className="h-40 w-full rounded-[2.5rem]" />
          <Skeleton className="h-80 w-full rounded-[2.5rem]" />
        </div>
      </div>
    </div>
  );
}