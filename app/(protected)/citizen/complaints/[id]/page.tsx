"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Hash,
  MapPin,
  MessageSquare,
  Printer,
  RefreshCw,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Shield,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { COMPLAINT_STATUS_CONFIG } from "@/app/(protected)/citizen/complaints/_components/form-steps/complaint";
import { COMPLAINT_PRIORITY_CONFIG } from "@/app/(protected)/citizen/complaints/_components/form-steps/complaint";
// Custom Components
import { CommentThread } from "@/app/(protected)/citizen/complaints/_components/CommentThread";

// No-SSR Map Import
const ComplaintMap = dynamic(
  () =>
    import(
      "@/app/(protected)/citizen/complaints/_components/form-steps/ComplaintMap"
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 text-xs font-medium">
        Loading map...
      </div>
    ),
  }
);

import { complaintsService } from "@/lib/supabase/queries/complaints";
import type {
  ComplaintComment,
  ComplaintStatusHistory,
} from "@/lib/supabase/queries/complaints";


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
  const [activeView, setActiveView] = useState<
    "overview" | "timeline" | "communication"
  >("overview");

  const subsRef = useRef<any[]>([]);

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

  useEffect(() => {
    loadComplaintData();

    const sub1 = complaintsService.subscribeToComplaint(
      complaintId,
      (payload) => {
        if (payload.eventType === "UPDATE") {
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
    const daysRemaining = Math.ceil((due - Date.now()) / (24 * 60 * 60 * 1000));

    return { isResolved, isOverdue, slaProgress, due, daysRemaining };
  }, [complaint]);

  if (isLoading) return <DetailSkeleton />;

  if (!complaint) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">
            Complaint Not Found
          </h2>
          <p className="text-muted-foreground">
            The requested complaint record could not be located.
          </p>
        </div>
      </div>
    );
  }

  const StatusIcon =
    COMPLAINT_STATUS_CONFIG[complaint.status as keyof typeof COMPLAINT_STATUS_CONFIG]?.icon ||
    AlertCircle;
  const statusConfig =
    COMPLAINT_STATUS_CONFIG[complaint.status as keyof typeof COMPLAINT_STATUS_CONFIG];
  const priorityConfig =
    COMPLAINT_PRIORITY_CONFIG[complaint.priority as keyof typeof COMPLAINT_PRIORITY_CONFIG];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="glass-strong  top-0 z-50 border-b border-border">
        <div className="container-padding mx-auto">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push("/citizen/complaints")}
                className="rounded-lg h-10 w-10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-sm font-bold">
                    {complaint.tracking_code}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Updated {formatDistanceToNow(new Date(complaint.updated_at))}{" "}
                  ago
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => loadComplaintData(true)}
                disabled={isRefreshing}
                className="rounded-lg"
              >
                <RefreshCw
                  className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button
                onClick={() => window.print()}
                className="rounded-lg bg-primary"
              >
                <Printer className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Print</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-padding mx-auto py-6 lg:py-8 max-w-7xl">
        {/* Header Card */}
        <div className="stone-card card-padding mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl lg:text-3xl font-bold mb-3">
                {complaint.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  className={cn(
                    "px-3 py-1.5 rounded-lg border",
                    statusConfig?.color || "bg-slate-500",
                    "text-white"
                  )}
                >
                  {statusConfig && <StatusIcon className="h-4 w-4 mr-1.5" />}
                  {statusConfig?.label || complaint.status}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "px-3 py-1.5 rounded-lg border",
                    priorityConfig?.color
                  )}
                >
                  <AlertCircle className="h-4 w-4 mr-1.5" />
                  {priorityConfig?.label || complaint.priority}
                </Badge>
              </div>
            </div>

            {/* SLA Timeline */}
            <div className="stone-panel p-4 w-full lg:w-80 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Resolution Timeline
                </span>
                {computed?.isOverdue && (
                  <Badge variant="destructive" className="text-xs">
                    Overdue
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Due Date</span>
                  <span className="font-semibold">
                    {format(computed!.due, "MMM dd, yyyy")}
                  </span>
                </div>
                {!computed?.isResolved && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Days Left</span>
                    <span
                      className={cn(
                        "font-bold tabular-nums",
                        computed?.isOverdue
                          ? "text-destructive"
                          : computed!.daysRemaining <= 2
                            ? "text-warning-amber"
                            : "text-success-green"
                      )}
                    >
                      {computed?.isOverdue
                        ? "Overdue"
                        : `${computed!.daysRemaining}d`}
                    </span>
                  </div>
                )}
                <Progress
                  value={computed?.slaProgress}
                  className="h-2 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
          {[
            { id: "overview", label: "Overview", icon: FileText },
            { id: "timeline", label: "Timeline", icon: Clock },
            {
              id: "communication",
              label: "Communication",
              icon: MessageSquare,
            },
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap",
                activeView === view.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-white hover:bg-muted border border-border"
              )}
            >
              <view.icon className="h-4 w-4" />
              {view.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeView === "overview" && (
              <>
                <Card className="stone-card">
                  <CardHeader className="card-padding border-b border-border">
                    <CardTitle>Complaint Description</CardTitle>
                  </CardHeader>
                  <CardContent className="card-padding">
                    <p className="leading-relaxed">{complaint.description}</p>
                  </CardContent>
                </Card>

                {complaint.attachments?.length > 0 && (
                  <Card className="stone-card">
                    <CardHeader className="card-padding border-b border-border">
                      <CardTitle>Evidence & Documentation</CardTitle>
                    </CardHeader>
                    <CardContent className="card-padding">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {complaint.attachments.map((file: any) => {
                          const uploadedBy =
                            file.user_id === complaint.citizen_id
                              ? "Citizen"
                              : "Staff";
                          return (
                            <div key={file.id} className="space-y-2">
                              <div className="aspect-square rounded-lg border-2 border-border overflow-hidden hover:border-primary transition-colors cursor-pointer group">
                                <img
                                  src={file.file_path}
                                  alt="Evidence"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div className="text-xs text-muted-foreground text-center font-medium">
                                Uploaded by {uploadedBy}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="stone-panel p-4">
                    <div className="flex items-center gap-3 text-primary mb-2">
                      <FileText className="h-5 w-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Category
                      </span>
                    </div>
                    <p className="font-semibold">{complaint.category?.name}</p>
                  </div>
                  <div className="stone-panel p-4">
                    <div className="flex items-center gap-3 text-secondary mb-2">
                      <Building2 className="h-5 w-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Department
                      </span>
                    </div>
                    <p className="font-semibold">
                      {complaint.department?.name || "Pending Assignment"}
                    </p>
                  </div>
                  <div className="stone-panel p-4">
                    <div className="flex items-center gap-3 text-accent mb-2">
                      <Calendar className="h-5 w-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Submitted
                      </span>
                    </div>
                    <p className="font-semibold">
                      {format(new Date(complaint.submitted_at), "PPP")}
                    </p>
                  </div>
                  <div className="stone-panel p-4">
                    <div className="flex items-center gap-3 text-highlight-tech mb-2">
                      <MapPin className="h-5 w-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Ward
                      </span>
                    </div>
                    <p className="font-semibold">
                      Ward {complaint.ward?.ward_number}
                    </p>
                  </div>
                </div>
              </>
            )}

            {activeView === "timeline" && (
              <Card className="stone-card">
                <CardHeader className="card-padding border-b border-border">
                  <CardTitle>Status History</CardTitle>
                </CardHeader>
                <CardContent className="card-padding">
                  <div className="relative space-y-6">
                    {statusHistory.map((h, i) => {
                      const isLast = i === statusHistory.length - 1;
                      const config =
                        COMPLAINT_STATUS_CONFIG[
                          h.new_status as keyof typeof COMPLAINT_STATUS_CONFIG
                        ];
                      const Icon = config?.icon || Activity;
                      return (
                        <div key={i} className="relative flex gap-4">
                          <div className="flex flex-col items-center">
                            <div
                              className={cn(
                                "h-10 w-10 rounded-lg flex items-center justify-center text-white shrink-0",
                                config?.color || "bg-slate-500"
                              )}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            {!isLast && (
                              <div className="w-0.5 flex-1 bg-border mt-2" />
                            )}
                          </div>
                          <div className="flex-1 pb-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                              <h3 className="font-bold capitalize">
                                {h.new_status.replace("_", " ")}
                              </h3>
                              <span className="text-xs text-muted-foreground font-mono">
                                {format(new Date(h.created_at), "PPp")}
                              </span>
                            </div>
                            {h.note && (
                              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg mt-2">
                                {h.note}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeView === "communication" && (
              <Card className="stone-card">
                <CardHeader className="card-padding border-b border-border">
                  <CardTitle>Comments & Updates</CardTitle>
                </CardHeader>
                <CardContent className="card-padding">
                  <CommentThread
                    complaintId={complaintId}
                    comments={comments}
                    isSubscribed={true}
                    onNewComment={(c) => setComments((p) => [...p, c])}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Citizen Info */}
            <Card className="stone-card">
              <CardHeader className="p-6 border-b border-border">
                <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                  Reported By
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={complaint.citizen?.profile?.profile_photo_url}
                    />
                    <AvatarFallback className="bg-accent/20 text-accent font-bold text-lg">
                      {complaint.citizen?.profile?.full_name?.charAt(0) || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">
                      {complaint.citizen?.profile?.full_name || "Citizen"}
                    </p>
                    <p className="text-xs text-muted-foreground">Complainant</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assigned Staff */}
            <Card className="stone-card">
              <CardHeader className="p-6 border-b border-border">
                <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                  Assigned To
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {complaint.staff ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={complaint.staff.profile?.profile_photo_url}
                      />
                      <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg">
                        {complaint.staff.profile?.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">
                        {complaint.staff.profile?.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {complaint.staff.staff_role.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                ) : computed?.isResolved ? (
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-success-green/20 flex items-center justify-center text-success-green shrink-0">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold">Resolved</p>
                      <p className="text-xs text-muted-foreground">
                        By {complaint.department?.name}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                      <Clock className="h-6 w-6" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Awaiting assignment
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="stone-card overflow-hidden">
              <CardHeader className="p-4 bg-muted border-b border-border">
                <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </CardTitle>
              </CardHeader>
              <div className="h-48 relative">
                <ComplaintMap
                  lat={complaint.latitude || 28.2096}
                  lng={complaint.longitude || 83.9856}
                />
              </div>
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-medium">{complaint.address_text}</p>
                <a
                  href={`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  View in Google Maps
                </a>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="container-padding mx-auto py-6 space-y-6 animate-pulse">
      <Skeleton className="h-12 w-64 rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}