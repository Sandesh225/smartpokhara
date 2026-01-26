// FILE: app/(protected)/citizen/complaints/[id]/page.tsx
"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
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
  Eye,
  TrendingUp,
  Paperclip,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { complaintsService } from "@/lib/supabase/queries/complaints";
import type {
  ComplaintComment,
  ComplaintStatusHistory,
} from "@/lib/supabase/queries/complaints";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// ────────────────────────────────────────────────
//  NEW IMPORTS for communication
// ────────────────────────────────────────────────
import CitizenStaffCommunication from "../_components/CitizenStaffCommunication";
import StaffCommunication from "../_components/StaffCommunication";

// Status Configuration
const COMPLAINT_STATUS_CONFIG = {
  pending: {
    label: "Pending Review",
    icon: Clock,
    color: "bg-amber-500",
    textColor: "text-amber-700",
  },
  in_progress: {
    label: "In Progress",
    icon: Activity,
    color: "bg-blue-600",
    textColor: "text-blue-700",
  },
  under_review: {
    label: "Under Review",
    icon: Eye,
    color: "bg-purple-600",
    textColor: "text-purple-700",
  },
  assigned: { label: "Assigned", icon: User, color: "bg-indigo-500" },
  resolved: {
    label: "Resolved",
    icon: CheckCircle,
    color: "bg-green-600",
    textColor: "text-green-700",
  },
  closed: {
    label: "Closed",
    icon: CheckCircle2,
    color: "bg-slate-600",
    textColor: "text-slate-700",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    color: "bg-red-600",
    textColor: "text-red-700",
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
  const [statusHistory, setStatusHistory] = useState<ComplaintStatusHistory[]>([]);
  const [activeView, setActiveView] = useState<
    "overview" | "timeline" | "communication"
  >("overview");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const subsRef = useRef<any[]>([]);

  // Get current user ID
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  const loadComplaintData = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setIsLoading(true);
      else setIsRefreshing(true);

      try {
        const data = await complaintsService.getComplaintById(complaintId);
        if (!data) throw new Error("Complaint not found");

        setComplaint(data);
        setComments(data.comments || []);
        setStatusHistory(data.status_history || []);
      } catch (err: any) {
        toast.error(err.message || "Failed to load complaint");
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
          toast.info("Complaint updated");
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
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Complaint Not Found</h2>
            <p className="text-muted-foreground">
              The requested complaint could not be found
            </p>
          </div>
          <Button
            onClick={() => router.push("/citizen/complaints")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Complaints
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig =
    COMPLAINT_STATUS_CONFIG[complaint.status as keyof typeof COMPLAINT_STATUS_CONFIG] || {
      label: complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1),
      icon: AlertCircle,
      color: "bg-gray-600",
      textColor: "text-gray-700",
    };

  const priorityConfig =
    COMPLAINT_PRIORITY_CONFIG[complaint.priority as keyof typeof COMPLAINT_PRIORITY_CONFIG] || {
      label:
        complaint.priority.charAt(0).toUpperCase() +
        complaint.priority.slice(1) +
        " Priority",
      color: "bg-gray-100 text-gray-700 border-gray-300",
      icon: AlertCircle,
    };

  const StatusIcon = statusConfig.icon || AlertCircle;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold mb-2 truncate">{complaint.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono font-semibold text-foreground">
                {complaint.tracking_code}
              </span>
              <span>•</span>
              <span>Updated {formatDistanceToNow(new Date(complaint.updated_at))} ago</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadComplaintData(true)}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className={`${statusConfig.color} text-white border-0`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig.label}
          </Badge>
          <Badge variant="outline" className={priorityConfig.color}>
            <priorityConfig.icon className="w-3 h-3 mr-1" />
            {priorityConfig.label}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Category", value: complaint.category?.name, icon: FileText },
          {
            label: "Department",
            value: complaint.department?.name || "Pending",
            icon: Building2,
          },
          {
            label: "Submitted",
            value: format(new Date(complaint.submitted_at), "MMM dd, yyyy"),
            icon: Calendar,
          },
          {
            label: "Ward",
            value: `Ward ${complaint.ward?.ward_number}`,
            icon: MapPin,
          },
        ].map((item, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="font-semibold text-sm truncate">{item.value || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "overview", label: "Overview", icon: FileText },
          { id: "timeline", label: "Timeline", icon: Clock },
          { id: "communication", label: "Chat with Staff", icon: MessageSquare },
        ].map((view) => (
          <Button
            key={view.id}
            variant={activeView === view.id ? "default" : "outline"}
            onClick={() => setActiveView(view.id as any)}
            className="gap-2"
          >
            <view.icon className="w-4 h-4" />
            {view.label}
          </Button>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeView === "overview" && (
            <>
              {/* Description */}
              <Card>
                <CardHeader className="border-b">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Description
                  </h3>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {complaint.description}
                  </p>
                </CardContent>
              </Card>

              {/* Attachments */}
              {complaint.attachments?.length > 0 && (
                <Card>
                  <CardHeader className="border-b">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-primary" />
                      Attachments ({complaint.attachments.length})
                    </h3>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {complaint.attachments.map((file: any, idx: number) => (
                        <div
                          key={file.id}
                          className="group relative aspect-square rounded-lg overflow-hidden border cursor-pointer hover:border-primary transition-colors"
                          onClick={() => setSelectedImage(file.file_path)}
                        >
                          <img
                            src={file.file_path}
                            alt={`Evidence ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SLA Timeline */}
              <Card>
                <CardHeader className="border-b">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Resolution Timeline
                  </h3>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Due Date</span>
                    <span className="font-semibold">
                      {format(computed!.due, "MMM dd, yyyy")}
                    </span>
                  </div>
                  {!computed?.isResolved && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Time Remaining</span>
                      <span
                        className={cn(
                          "font-semibold",
                          computed?.isOverdue
                            ? "text-destructive"
                            : computed!.daysRemaining <= 2
                            ? "text-amber-600"
                            : "text-green-600"
                        )}
                      >
                        {computed?.isOverdue
                          ? "Overdue"
                          : `${computed!.daysRemaining} days`}
                      </span>
                    </div>
                  )}
                  <Progress value={computed?.slaProgress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Submitted</span>
                    <span>{Math.round(computed?.slaProgress || 0)}%</span>
                    <span>Due</span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeView === "timeline" && (
            <Card>
              <CardHeader className="border-b">
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Status History
                </h3>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {statusHistory.map((h, i) => {
                    const isLast = i === statusHistory.length - 1;
                    const config =
                      COMPLAINT_STATUS_CONFIG[
                        h.new_status as keyof typeof COMPLAINT_STATUS_CONFIG
                      ] || {
                        label:
                          h.new_status.charAt(0).toUpperCase() +
                          h.new_status.slice(1),
                        icon: AlertCircle,
                        color: "bg-gray-600",
                      };
                    const Icon = config.icon || Activity;

                    return (
                      <div key={i} className="relative flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`h-10 w-10 rounded-lg flex items-center justify-center text-white ${config.color}`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          {!isLast && <div className="w-px flex-1 bg-border mt-2" />}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold capitalize">
                              {h.new_status.replace("_", " ")}
                            </h4>
                            <span className="text-xs text-muted-foreground font-mono">
                              {format(new Date(h.created_at), "MMM dd, HH:mm")}
                            </span>
                          </div>
                          {h.note && (
                            <p className="text-sm text-muted-foreground">{h.note}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ────────────────────────────────────────────────
              COMMUNICATION SECTION (updated with CitizenStaffCommunication)
          ──────────────────────────────────────────────── */}
          {activeView === "communication" && (
            <>
              {complaint.assigned_staff_id && currentUserId ? (
                <div className="space-y-6">
                  {/* Primary: Citizen ↔ Assigned Staff Chat */}
                  <CitizenStaffCommunication
                    complaintId={complaintId}
                    currentUserId={currentUserId}
                    userRole="citizen"
                    assignedStaffName={
                      complaint.staff?.profile?.full_name ||
                      complaint.staff?.user?.email ||
                      "Assigned Staff"
                    }
                    citizenName={complaint.citizen?.profile?.full_name || "Citizen"}
                  />

                  {/* Optional: Supervisor / Department chat (if escalated/supervised) */}
                  {complaint.assigned_department_id && (
                    <div className="mt-8 pt-6 border-t">
                      <div className="flex items-center gap-2 mb-4 px-1">
                        <Shield className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">
                          Department Supervisor Available
                        </span>
                      </div>

                      <StaffCommunication
                        complaintId={complaintId}
                        currentUserId={currentUserId}
                        isStaff={false}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <MessageSquare className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          Communication Not Available Yet
                        </h3>
                        <p className="text-muted-foreground text-sm max-w-md">
                          Once your complaint is assigned to a staff member, you'll be
                          able to chat with them directly here.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Reported By */}
          <Card>
            <CardHeader className="border-b bg-primary/5">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <User className="w-4 h-4" />
                Reported By
              </h3>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-lg font-bold">
                  {complaint.citizen?.profile?.full_name?.charAt(0) || "C"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {complaint.citizen?.profile?.full_name || "Citizen"}
                  </p>
                  <p className="text-xs text-muted-foreground">Complainant</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned To */}
          <Card>
            <CardHeader className="border-b bg-primary/5">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Assigned To
              </h3>
            </CardHeader>
            <CardContent className="p-6">
              {complaint.assigned_staff_id && complaint.staff ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-blue-500 flex items-center justify-center text-lg font-bold text-white">
                      {complaint.staff.profile?.full_name?.charAt(0) || "S"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {complaint.staff.profile?.full_name ||
                          complaint.staff.user?.email ||
                          "Assigned Staff"}
                      </p>
                      <p className="text-xs text-primary capitalize">
                        {complaint.staff.staff_role?.replace(/_/g, " ") || "Staff Member"}
                      </p>
                    </div>
                  </div>

                  {complaint.staff.staff_code && (
                    <div className="pt-3 border-t text-xs">
                      <span className="text-muted-foreground">ID: </span>
                      <span className="font-mono font-semibold">
                        {complaint.staff.staff_code}
                      </span>
                    </div>
                  )}
                </div>
              ) : complaint.assigned_department_id ? (
                <p className="text-sm text-muted-foreground">
                  Awaiting staff assignment
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Not yet assigned</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>
          <img
            src={selectedImage}
            alt="Full view"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 pb-12">
      <div className="h-16 bg-muted rounded-lg animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-24 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-48 bg-muted rounded-lg animate-pulse" />
          <div className="h-64 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="space-y-6">
          <div className="h-32 bg-muted rounded-lg animate-pulse" />
          <div className="h-32 bg-muted rounded-lg animate-pulse" />
          <div className="h-64 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}