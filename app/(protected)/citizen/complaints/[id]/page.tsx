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
  Download,
  Eye,
  ChevronRight,
  TrendingUp,
  Users,
  Paperclip,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// No-SSR Map Import
const ComplaintMap = dynamic(
  () =>
    import(
      "@/app/(protected)/citizen/complaints/_components/form-steps/ComplaintMap"
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-background animate-pulse flex items-center justify-center">
        <div className="text-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm font-medium text-muted-foreground">Loading map...</p>
        </div>
      </div>
    ),
  }
);
import { CommentThread } from "@/app/(protected)/citizen/complaints/_components/CommentThread";
import { complaintsService } from "@/lib/supabase/queries/complaints";
import type {
  ComplaintComment,
  ComplaintStatusHistory,
} from "@/lib/supabase/queries/complaints";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import {
  Container,
  Section,
  PageHeader,
  Grid,
} from "@/lib/design-system/container";

import { cn } from "@/lib/utils";

// Status Configuration
const COMPLAINT_STATUS_CONFIG = {
  pending: {
    label: "Pending Review",
    icon: Clock,
    color: "bg-amber-500",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
  },
  in_progress: {
    label: "In Progress",
    icon: Activity,
    color: "bg-blue-600",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
  },
  under_review: {
    label: "Under Review",
    icon: Eye,
    color: "bg-purple-600",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle,
    color: "bg-green-600",
    textColor: "text-green-700",
    borderColor: "border-green-200",
  },
  closed: {
    label: "Closed",
    icon: CheckCircle2,
    color: "bg-slate-600",
    textColor: "text-slate-700",
    borderColor: "border-slate-200",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    color: "bg-red-600",
    textColor: "text-red-700",
    borderColor: "border-red-200",
  },
};

const COMPLAINT_PRIORITY_CONFIG = {
  low: {
    label: "Low Priority",
    color: "bg-slate-100 text-slate-700 border-slate-300",
    icon: TrendingUp,
  },
  medium: {
    label: "Medium Priority",
    color: "bg-amber-100 text-amber-700 border-amber-300",
    icon: AlertCircle,
  },
  high: {
    label: "High Priority",
    color: "bg-orange-100 text-orange-700 border-orange-300",
    icon: AlertCircle,
  },
  urgent: {
    label: "Urgent",
    color: "bg-red-100 text-red-700 border-red-300",
    icon: AlertCircle,
  },
};

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
        toast.error(err.message || "Failed to load complaint data");
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
          toast.info("Complaint updated in real-time");
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
          toast.success("New comment received");
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <AlertCircle className="h-20 w-20 text-destructive mx-auto" />
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-foreground">
              Complaint Not Found
            </h2>
            <p className="text-muted-foreground text-lg">
              The requested complaint record could not be located in our system.
            </p>
          </div>
          <Button
            onClick={() => router.push("/citizen/complaints")}
            className="h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black elevation-2 px-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Complaints
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = COMPLAINT_STATUS_CONFIG[
    complaint.status as keyof typeof COMPLAINT_STATUS_CONFIG
  ] || {
    label: complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1),
    icon: AlertCircle,
    color: "bg-gray-600",
    textColor: "text-gray-700",
    borderColor: "border-gray-200",
  };
  const priorityConfig = COMPLAINT_PRIORITY_CONFIG[
    complaint.priority as keyof typeof COMPLAINT_PRIORITY_CONFIG
  ] || {
    label:
      complaint.priority.charAt(0).toUpperCase() +
      complaint.priority.slice(1) +
      " Priority",
    color: "bg-gray-100 text-gray-700 border-gray-300",
    icon: AlertCircle,
  };
  const StatusIcon = statusConfig?.icon || AlertCircle;

  return (
    <div className="min-h-screen -mt-12">
      <Container size="wide">
        <Section>
          <PageHeader
            title={complaint.title}
            subtitle={
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-sm font-bold text-foreground tracking-tight">
                  {complaint.tracking_code}
                </span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/30"></span>
                <span className="text-xs text-muted-foreground font-medium">
                  Updated {formatDistanceToNow(new Date(complaint.updated_at))}{" "}
                  ago
                </span>
              </div>
            }
            badge={
              <>
                <Badge
                  className={`glass text-xs font-black uppercase border-2 px-3 py-1.5 ${statusConfig.color} text-white border-transparent`}
                >
                  <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                  {statusConfig.label}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs font-black uppercase border-2 px-3 py-1.5 ${priorityConfig.color}`}
                >
                  <priorityConfig.icon className="w-3.5 h-3.5 mr-1.5" />
                  {priorityConfig.label}
                </Badge>
              </>
            }
            actions={
              <>
                <Button
                  variant="outline"
                  onClick={() => loadComplaintData(true)}
                  disabled={isRefreshing}
                  className="stone-card h-11 rounded-xl border-2 font-bold"
                >
                  <RefreshCw
                    className={cn(
                      "w-4 h-4 mr-2",
                      isRefreshing && "animate-spin"
                    )}
                  />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="stone-card h-11 rounded-xl border-2 font-bold"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="stone-card h-11 rounded-xl border-2 font-bold"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </>
            }
          />

          <Grid cols={4} className="mb-6">
            {[
              {
                label: "Category",
                value: complaint.category?.name,
                icon: FileText,
                color: "bg-indigo-500",
              },
              {
                label: "Department",
                value: complaint.department?.name || "Pending Assignment",
                icon: Building2,
                color: "bg-purple-500",
              },
              {
                label: "Submitted",
                value: format(new Date(complaint.submitted_at), "PPP"),
                icon: Calendar,
                color: "bg-blue-500",
              },
              {
                label: "Ward",
                value: `Ward ${complaint.ward?.ward_number}`,
                icon: MapPin,
                color: "bg-green-500",
              },
            ].map((item, idx) => (
              <Card
                key={idx}
                className="stone-card border-2 border-border elevation-2 transition-all hover:elevation-3"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                        {item.label}
                      </p>
                      <h3 className="mt-2 text-xl font-black text-foreground">
                        {item.value || "N/A"}
                      </h3>
                    </div>
                    <div
                      className={cn("p-3 rounded-2xl elevation-1", item.color)}
                    >
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </Grid>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: "overview", label: "Overview", icon: FileText },
              { id: "timeline", label: "Timeline", icon: Clock },
              {
                id: "communication",
                label: "Communication",
                icon: MessageSquare,
              },
            ].map((view) => (
              <Button
                key={view.id}
                variant={activeView === view.id ? "default" : "outline"}
                onClick={() => setActiveView(view.id as any)}
                className={cn(
                  "h-11 rounded-xl font-bold elevation-2",
                  activeView === view.id
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "stone-card border-2 border-border"
                )}
              >
                <view.icon className="w-4 h-4 mr-2" />
                {view.label}
              </Button>
            ))}
          </div>

          <Grid cols={3} gap={6}>
            <div className="col-span-2 space-y-6">
              {activeView === "overview" && (
                <>
                  <Card className="stone-card border-2 border-border elevation-2 transition-all hover:elevation-3">
                    <CardHeader className="border-b-2 border-border p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl elevation-1 bg-muted">
                          <FileText className="w-5 h-5 text-foreground" />
                        </div>
                        <h2 className="text-xl font-black text-foreground">
                          Complaint Description
                        </h2>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-muted-foreground leading-relaxed">
                        {complaint.description}
                      </p>
                    </CardContent>
                  </Card>

                  {complaint.attachments?.length > 0 && (
                    <Card className="stone-card border-2 border-border elevation-2 transition-all hover:elevation-3">
                      <CardHeader className="border-b-2 border-border p-6">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-2xl elevation-1 bg-muted">
                            <Paperclip className="w-5 h-5 text-foreground" />
                          </div>
                          <div>
                            <h2 className="text-xl font-black text-foreground">
                              Evidence & Documentation
                            </h2>
                            <p className="text-sm text-muted-foreground">
                              {complaint.attachments.length} file(s) attached
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {complaint.attachments.map(
                            (file: any, idx: number) => (
                              <div
                                key={file.id}
                                className="group relative aspect-square rounded-xl overflow-hidden border-2 border-border hover:border-primary transition-all duration-300 elevation-1 hover:elevation-2 cursor-pointer"
                                onClick={() => setSelectedImage(file.file_path)}
                              >
                                <img
                                  src={file.file_path}
                                  alt={`Evidence ${idx + 1}`}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                  <Eye className="w-8 h-8 text-primary" />
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="stone-card border-2 border-border elevation-2 transition-all hover:elevation-3">
                    <CardHeader className="border-b-2 border-border p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl elevation-1 bg-muted">
                          <Clock className="w-5 h-5 text-foreground" />
                        </div>
                        <h2 className="text-xl font-black text-foreground">
                          Resolution Timeline
                        </h2>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          Due Date
                        </span>
                        <span className="font-black text-foreground">
                          {format(computed!.due, "MMM dd, yyyy")}
                        </span>
                      </div>
                      {!computed?.isResolved && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            Time Remaining
                          </span>
                          <span
                            className={cn(
                              "font-black",
                              computed?.isOverdue
                                ? "text-destructive"
                                : computed!.daysRemaining <= 2
                                  ? "text-amber-600"
                                  : "text-secondary"
                            )}
                          >
                            {computed?.isOverdue
                              ? "Overdue"
                              : `${computed!.daysRemaining} days`}
                          </span>
                        </div>
                      )}
                      <Progress value={computed?.slaProgress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground font-medium">
                        <span>Submitted</span>
                        <span>{Math.round(computed?.slaProgress || 0)}%</span>
                        <span>Due</span>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {activeView === "timeline" && (
                <Card className="stone-card border-2 border-border elevation-2 transition-all hover:elevation-3">
                  <CardHeader className="border-b-2 border-border p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl elevation-1 bg-muted">
                        <Clock className="w-5 h-5 text-foreground" />
                      </div>
                      <h2 className="text-xl font-black text-foreground">
                        Status History
                      </h2>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-8">
                      {statusHistory.map((h, i) => {
                        const isLast = i === statusHistory.length - 1;
                        const config = COMPLAINT_STATUS_CONFIG[
                          h.new_status as keyof typeof COMPLAINT_STATUS_CONFIG
                        ] || {
                          label:
                            h.new_status.charAt(0).toUpperCase() +
                            h.new_status.slice(1),
                          icon: AlertCircle,
                          color: "bg-gray-600",
                          textColor: "text-gray-700",
                          borderColor: "border-gray-200",
                        };
                        const Icon = config?.icon || Activity;
                        return (
                          <div key={i} className="relative flex gap-5">
                            <div className="flex flex-col items-center">
                              <div
                                className={`h-12 w-12 rounded-xl flex items-center justify-center text-white ${config?.color}`}
                              >
                                <Icon className="h-6 w-6" />
                              </div>
                              {!isLast && (
                                <div className="w-0.5 flex-1 bg-border mt-3"></div>
                              )}
                            </div>
                            <div className="flex-1 pb-8">
                              <Card className="stone-card border-2 border-border elevation-1">
                                <CardContent className="p-5">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                                    <h3 className="text-lg font-black text-foreground capitalize">
                                      {h.new_status.replace("_", " ")}
                                    </h3>
                                    <Badge
                                      variant="outline"
                                      className="border-2 border-border text-xs font-mono"
                                    >
                                      <Calendar className="h-3 w-3 mr-1" />
                                      {format(new Date(h.created_at), "PPp")}
                                    </Badge>
                                  </div>
                                  {h.note && (
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                      {h.note}
                                    </p>
                                  )}
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeView === "communication" && (
                <Card className="stone-card border-2 border-border elevation-2 transition-all hover:elevation-3">
                  <CardHeader className="border-b-2 border-border p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl elevation-1 bg-muted">
                        <MessageSquare className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-foreground">
                          Comments & Updates
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {comments.length} message(s)
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
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

            <div className="space-y-6">
              <Card className="stone-card border-2 border-border elevation-2 transition-all hover:elevation-3">
                <CardHeader className="border-b-2 border-border p-6 bg-primary text-primary-foreground">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5" />
                    <h2 className="text-sm font-black uppercase tracking-widest">
                      Reported By
                    </h2>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center text-2xl font-black text-foreground elevation-1">
                      {complaint.citizen?.profile?.full_name?.charAt(0) || "C"}
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-foreground text-lg truncate">
                        {complaint.citizen?.profile?.full_name || "Citizen"}
                      </p>
                      <p className="text-sm text-muted-foreground font-medium">
                        Complainant
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="stone-card border-2 border-border elevation-2 transition-all hover:elevation-3">
                <CardHeader className="border-b-2 border-border p-6 bg-primary text-primary-foreground">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5" />
                    <h2 className="text-sm font-black uppercase tracking-widest">
                      Assigned To
                    </h2>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {complaint.staff ? (
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center text-2xl font-black text-foreground elevation-1">
                        {complaint.staff.profile?.full_name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-foreground text-lg truncate">
                          {complaint.staff.profile?.full_name}
                        </p>
                        <p className="text-sm text-muted-foreground font-medium capitalize">
                          {complaint.staff.staff_role.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                  ) : computed?.isResolved ? (
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center elevation-1">
                        <CheckCircle2 className="h-8 w-8 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-foreground text-lg">
                          Resolved
                        </p>
                        <p className="text-sm text-muted-foreground">
                          By {complaint.department?.name}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center elevation-1">
                        <Clock className="h-8 w-8 text-amber-600 animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-foreground text-lg">
                          Pending
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Awaiting assignment
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="stone-card border-2 border-border elevation-2 transition-all hover:elevation-3">
                <CardHeader className="border-b-2 border-border p-6 bg-primary text-primary-foreground">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5" />
                    <h2 className="text-sm font-black uppercase tracking-widest">
                      Location
                    </h2>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-64 relative overflow-hidden">
                    <ComplaintMap
                      lat={complaint.latitude || 28.2096}
                      lng={complaint.longitude || 83.9856}
                    />
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                      {complaint.address_text}
                    </p>
                    <a
                      href={`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black elevation-2">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View in Google Maps
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Grid>
        </Section>
      </Container>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <Button
            variant="ghost"
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4"
          >
            <X className="h-6 w-6" />
          </Button>
          <img
            src={selectedImage}
            alt="Evidence full view"
            className="max-w-full max-h-[90vh] object-contain rounded-xl elevation-3"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="min-h-screen -mt-12">
      <Container size="wide">
        <Section>
          <div className="h-20 bg-muted rounded-xl animate-pulse mb-6"></div>
          <Grid cols={4} className="mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl animate-pulse"></div>
            ))}
          </Grid>
          <div className="flex gap-2 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-11 w-32 bg-muted rounded-xl animate-pulse"></div>
            ))}
          </div>
          <Grid cols={3} gap={6}>
            <div className="col-span-2 space-y-6">
              <div className="h-48 bg-muted rounded-xl animate-pulse"></div>
              <div className="h-64 bg-muted rounded-xl animate-pulse"></div>
              <div className="h-32 bg-muted rounded-xl animate-pulse"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-muted rounded-xl animate-pulse"></div>
              <div className="h-48 bg-muted rounded-xl animate-pulse"></div>
              <div className="h-96 bg-muted rounded-xl animate-pulse"></div>
            </div>
          </Grid>
        </Section>
      </Container>
    </div>
  );
}