"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  RefreshCw,
  Printer,
  Share2,
  AlertCircle,
  Clock,
  MapPin,
  Building2,
  CheckCircle2,
  MessageSquare,
  Paperclip,
  User,
  MoreHorizontal,
  FileText,
  Droplets,
  Lightbulb,
  Trash2,
  Construction,
  Trees,
  Volume2,
  Shield,
  ThumbsUp,
} from "lucide-react";
import { toast } from "sonner";

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/ui/card";
import { Button } from "@/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Separator } from "@/ui/separator";
import { Badge } from "@/ui/badge";
import { Skeleton } from "@/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { ScrollArea } from "@/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";

// Import Custom Components
import { CommentThread } from "@/components/citizen/complaints/CommentThread";
import { FeedbackForm } from "@/components/citizen/complaints/FeedbackForm";

// Services & Types
import { complaintsService } from "@/lib/supabase/queries/complaints";
import type {
  ComplaintComment,
  ComplaintStatusHistory,
} from "@/lib/supabase/queries/complaints";

// ----------------------------------------------------------------------
// UI HELPERS
// ----------------------------------------------------------------------

const formatName = (name: string | null | undefined) => {
  if (!name) return "N/A";
  if (name.includes("-")) {
    return name.split("-").pop()?.trim();
  }
  return name;
};

const getCategoryIcon = (name: string | null | undefined) => {
  const lower = (name || "").toLowerCase();
  if (lower.includes("water") || lower.includes("leak"))
    return <Droplets className="h-6 w-6" />;
  if (lower.includes("electric") || lower.includes("light"))
    return <Lightbulb className="h-6 w-6" />;
  if (lower.includes("waste") || lower.includes("trash"))
    return <Trash2 className="h-6 w-6" />;
  if (lower.includes("road") || lower.includes("pothole"))
    return <Construction className="h-6 w-6" />;
  if (lower.includes("tree") || lower.includes("garden"))
    return <Trees className="h-6 w-6" />;
  if (lower.includes("noise")) return <Volume2 className="h-6 w-6" />;
  return <FileText className="h-6 w-6" />;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "resolved":
      return "text-green-600 bg-green-50 border-green-200";
    case "closed":
      return "text-slate-600 bg-slate-50 border-slate-200";
    case "rejected":
      return "text-red-600 bg-red-50 border-red-200";
    case "in_progress":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "assigned":
      return "text-indigo-600 bg-indigo-50 border-indigo-200";
    default:
      return "text-amber-600 bg-amber-50 border-amber-200";
  }
};

const PROGRESS_STEPS = [
  { id: "received", label: "Received" },
  { id: "assigned", label: "Assigned" },
  { id: "in_progress", label: "In Progress" },
  { id: "resolved", label: "Resolved" },
];

// ----------------------------------------------------------------------
// MAIN PAGE COMPONENT
// ----------------------------------------------------------------------

export default function ComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const complaintId = params.id as string;

  const [complaint, setComplaint] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time data
  const [comments, setComments] = useState<ComplaintComment[]>([]);
  const [statusHistory, setStatusHistory] = useState<ComplaintStatusHistory[]>(
    []
  );
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  // ----------------------------------------------------------------------
  // DATA FETCHING & SUBSCRIPTIONS
  // ----------------------------------------------------------------------

  useEffect(() => {
    if (complaintId) {
      fetchComplaintData();
      setupSubscriptions();
    }
    return () => {
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
  }, [complaintId]);

  const fetchComplaintData = async () => {
    setIsLoading(true);
    setError(null);
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
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const setupSubscriptions = () => {
    const sub1 = complaintsService.subscribeToComplaint(
      complaintId,
      (payload) => {
        if (payload.eventType === "UPDATE") {
          setComplaint((prev: any) => ({ ...prev, ...payload.new }));
          if (payload.new.status !== payload.old?.status) {
            toast.success(
              `Status updated to ${payload.new.status.replace("_", " ")}`
            );
          }
        }
      }
    );

    const sub2 = complaintsService.subscribeToComments(
      complaintId,
      (payload) => {
        if (payload.eventType === "INSERT") {
          setComments((prev) => [...prev, payload.new]);
        }
      }
    );

    setSubscriptions([sub1, sub2]);
    setIsSubscribed(true);
  };

  // ----------------------------------------------------------------------
  // ACTION HANDLERS
  // ----------------------------------------------------------------------

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: "Complaint Details", url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  const handlePrint = () => window.print();

  const handleRefresh = () => {
    fetchComplaintData();
    toast.success("Complaint details refreshed");
  };

  // ----------------------------------------------------------------------
  // RENDER HELPERS
  // ----------------------------------------------------------------------

  const getCurrentStepIndex = () => {
    if (!complaint) return 0;
    if (complaint.status === "closed") return 4;
    if (complaint.status === "rejected") return 0;
    return PROGRESS_STEPS.findIndex((s) => s.id === complaint.status);
  };

  if (isLoading) return <ComplaintSkeleton />;
  if (error || !complaint)
    return <ComplaintError error={error} router={router} />;

  const CategoryIcon = getCategoryIcon(complaint.category?.name);
  const activeStep = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* HEADER SECTION */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/citizen/complaints")}
                className="hover:bg-slate-100"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </Button>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 line-clamp-1">
                    {complaint.title}
                  </h1>
                  <Badge variant="outline" className="font-mono text-xs">
                    #{complaint.tracking_code}
                  </Badge>
                  <Badge
                    className={`${getStatusColor(complaint.status)} border font-medium capitalize`}
                  >
                    {complaint.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3" />
                  Submitted on{" "}
                  {format(new Date(complaint.submitted_at), "MMM d, yyyy")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile Actions */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handlePrint}>
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Desktop Actions */}
              <div className="hidden md:flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="gap-2 hover:bg-slate-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="gap-2 hover:bg-slate-50"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="gap-2 hover:bg-slate-50"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                {isSubscribed && (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 animate-pulse">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                    Live
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* STATUS TRACKER */}
        <Card className="border-slate-200/60 shadow-md overflow-hidden">
          <CardContent className="p-6">
            <div className="relative flex justify-between">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 rounded-full" />
              <div
                className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 -z-10 rounded-full transition-all duration-500"
                style={{
                  width: `${(activeStep / (PROGRESS_STEPS.length - 1)) * 100}%`,
                }}
              />

              {PROGRESS_STEPS.map((step, index) => {
                const isCompleted = index <= activeStep;
                const isCurrent = index === activeStep;

                return (
                  <div
                    key={step.id}
                    className="flex flex-col items-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 px-2"
                  >
                    <div
                      className={`
                        h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                        ${isCompleted ? "bg-gradient-to-br from-green-500 to-emerald-500 border-green-500 text-white shadow-lg" : "bg-white border-slate-300 text-slate-300"}
                        ${isCurrent ? "ring-4 ring-green-100 scale-110" : ""}
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-slate-200" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-semibold mt-2 text-center ${isCompleted ? "text-green-700" : "text-slate-400"}`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* LEFT COLUMN: Main Details & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* ISSUE SUMMARY CARD */}
            <Card className="border-slate-200/60 shadow-md overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600" />
              <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl text-blue-600 shadow-sm">
                  {CategoryIcon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="text-lg font-bold text-slate-900">
                      {formatName(complaint.category?.name)}
                    </h2>
                    {complaint.subcategory && (
                      <Badge
                        variant="secondary"
                        className="text-xs font-normal"
                      >
                        {complaint.subcategory.name}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    Priority:{" "}
                    <Badge
                      className={`uppercase text-[10px] px-2 py-0.5 ${
                        complaint.priority === "critical"
                          ? "bg-red-100 text-red-700"
                          : complaint.priority === "urgent"
                            ? "bg-orange-100 text-orange-700"
                            : complaint.priority === "high"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {complaint.priority}
                    </Badge>
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {complaint.description}
                </p>

                {/* Attachments Preview */}
                {attachments.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-blue-600" />
                      Attached Evidence ({attachments.length})
                    </h3>
                    <ScrollArea className="w-full whitespace-nowrap pb-2">
                      <div className="flex gap-3">
                        {attachments.map((file: any) => (
                          <a
                            key={file.id}
                            href={file.file_path}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-blue-300 transition-all duration-200 group"
                          >
                            <div className="h-10 w-10 rounded bg-white border flex items-center justify-center group-hover:scale-110 transition-transform">
                              {file.file_type?.includes("image") ? (
                                <FileText className="h-5 w-5 text-blue-500" />
                              ) : (
                                <Paperclip className="h-5 w-5 text-slate-400" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-slate-700 truncate max-w-[120px]">
                                {file.file_name}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {(file.file_size / 1024).toFixed(0)} KB
                              </span>
                            </div>
                          </a>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ACTIVITY TABS */}
            <Card className="border-slate-200/60 shadow-md overflow-hidden">
              <Tabs defaultValue="comments" className="w-full">
                <div className="px-6 pt-6 pb-2 border-b border-slate-100 bg-gradient-to-r from-white/90 to-blue-50/30">
                  <TabsList className="w-full justify-start bg-transparent p-0 gap-6">
                    <TabsTrigger
                      value="comments"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none data-[state=active]:text-blue-600 px-0 pb-2 transition-all"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Comments ({comments.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="timeline"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none data-[state=active]:text-blue-600 px-0 pb-2 transition-all"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      History
                    </TabsTrigger>
                    {complaint.status === "resolved" && (
                      <TabsTrigger
                        value="feedback"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none data-[state=active]:text-blue-600 px-0 pb-2 transition-all"
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Feedback
                      </TabsTrigger>
                    )}
                  </TabsList>
                </div>

                <div className="p-6">
                  <TabsContent value="comments" className="mt-0 space-y-6">
                    <CommentThread
                      complaintId={complaintId}
                      comments={comments}
                      isSubscribed={isSubscribed}
                      onNewComment={(c) => setComments((prev) => [...prev, c])}
                    />
                  </TabsContent>

                  <TabsContent value="timeline" className="mt-0">
                    <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pl-8 py-2">
                      {statusHistory.map((history, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[41px] h-6 w-6 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center shadow-sm">
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                          </div>
                          <p className="text-sm font-medium text-slate-900">
                            Status changed to{" "}
                            <span className="capitalize font-semibold text-blue-600">
                              {history.new_status.replace("_", " ")}
                            </span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {format(
                              new Date(history.created_at),
                              "MMM d, yyyy 'at' h:mm a"
                            )}
                          </p>
                          {history.note && (
                            <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                              {history.note}
                            </p>
                          )}
                        </div>
                      ))}

                      <div className="relative">
                        <div className="absolute -left-[41px] h-6 w-6 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center shadow-sm">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                        </div>
                        <p className="text-sm font-medium text-slate-900">
                          Complaint Submitted
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {format(
                            new Date(complaint.submitted_at),
                            "MMM d, yyyy 'at' h:mm a"
                          )}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="feedback">
                    <FeedbackForm
                      complaintId={complaintId}
                      complaintStatus={complaint.status}
                      onSubmitSuccess={() => fetchComplaintData()}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </Card>
          </div>

          {/* RIGHT COLUMN: Sidebar Info */}
          <div className="space-y-6">
            {/* LOCATION CARD */}
            <Card className="shadow-md border-slate-200/60 overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-blue-50/30 border-b">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" /> Location Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex gap-3">
                  <div className="mt-1">
                    <Building2 className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Ward {complaint.ward?.ward_number}
                    </p>
                    <p className="text-xs text-slate-500">
                      {complaint.ward?.name}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-3">
                  <div className="mt-1">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-700 leading-snug">
                      {complaint.address_text}
                    </p>
                    {complaint.landmark && (
                      <p className="text-xs text-slate-500 mt-1 italic">
                        Near: {complaint.landmark}
                      </p>
                    )}
                  </div>
                </div>

                {/* Mini Map Placeholder */}
                <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg border border-slate-200 flex items-center justify-center relative overflow-hidden group cursor-pointer hover:shadow-md transition-all">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="relative z-10 shadow-sm"
                  >
                    View on Map
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ASSIGNMENT INFO */}
            <Card className="shadow-md border-slate-200/60 overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-blue-50/30 border-b">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" /> Official Handling
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Assigned Department
                  </p>
                  <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-500" />
                    {formatName(complaint.department?.name) ||
                      "Pending Assignment"}
                  </p>
                </div>

                <Separator />

                {complaint.staff ? (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">
                      Assigned Officer
                    </p>
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-slate-50 to-blue-50/20 rounded-lg border border-slate-100">
                      <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                        <AvatarImage
                          src={complaint.staff.profile?.profile_photo_url}
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {complaint.staff.profile?.full_name || "Staff Member"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {complaint.staff.staff_role}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Alert className="bg-amber-50 border-amber-200 py-3">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800 text-xs mt-0.5">
                      Waiting for staff assignment. Typically takes 24h.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* SLA / DATES */}
            <Card className="shadow-md border-slate-200/60 bg-gradient-to-br from-slate-50/50 to-blue-50/20 overflow-hidden">
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Created</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {format(new Date(complaint.submitted_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">
                      Target Resolution
                    </p>
                    <p className="text-sm font-semibold text-blue-700">
                      {complaint.sla_due_at
                        ? format(new Date(complaint.sla_due_at), "MMM d, yyyy")
                        : "Calculating..."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplaintSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function ComplaintError({
  error,
  router,
}: {
  error: string | null;
  router: any;
}) {
  return (
    <div className="flex h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-200 bg-red-50 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-red-900">
            Unable to Load Complaint
          </CardTitle>
          <CardDescription className="text-red-700">
            {error || "An unexpected error occurred while fetching details."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3 justify-center">
          <Button
            variant="outline"
            className="bg-white border-red-200 hover:bg-red-100 text-red-700"
            onClick={() => router.back()}
          >
            Go Back
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
