"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Activity,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  TrendingUp,
  Paperclip,
  BarChart3,
  FileCheck,
  Zap,
  Phone,
  Mail,
  BadgeCheck,
  Camera,
  Image as ImageIcon,
  Printer,
  RefreshCw,
  MessageSquare,
  MapPin,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useComplaint } from "@/features/complaints/hooks/useComplaint";
import { useCurrentUser } from "@/features/users/hooks/useCurrentUser";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import CitizenStaffCommunication from "../_components/CitizenStaffCommunication";
import StaffCommunication from "../_components/StaffCommunication";

// Enhanced Status Configuration
const COMPLAINT_STATUS_CONFIG = {
  pending: {
    label: "Pending Review",
    icon: Clock,
    color: "bg-gradient-to-br from-amber-500 to-orange-600",
    dotColor: "bg-amber-500",
    borderColor: "border-amber-200",
    bgLight: "bg-amber-50 dark:bg-amber-950/30",
    textColor: "text-amber-900 dark:text-amber-100",
    ringColor: "ring-amber-500/20",
  },
  in_progress: {
    label: "In Progress",
    icon: Activity,
    color: "bg-gradient-to-br from-blue-500 to-indigo-600",
    dotColor: "bg-blue-500",
    borderColor: "border-blue-200 dark:border-blue-800",
    bgLight: "bg-blue-50 dark:bg-blue-950/30",
    textColor: "text-blue-900 dark:text-blue-100",
    ringColor: "ring-blue-500/20",
  },
  under_review: {
    label: "Under Review",
    icon: Eye,
    color: "bg-gradient-to-br from-purple-500 to-violet-600",
    dotColor: "bg-purple-500",
    borderColor: "border-purple-200 dark:border-purple-800",
    bgLight: "bg-purple-50 dark:bg-purple-950/30",
    textColor: "text-purple-900 dark:text-purple-100",
    ringColor: "ring-purple-500/20",
  },
  assigned: {
    label: "Assigned",
    icon: User,
    color: "bg-gradient-to-br from-indigo-500 to-blue-600",
    dotColor: "bg-indigo-500",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    bgLight: "bg-indigo-50 dark:bg-indigo-950/30",
    textColor: "text-indigo-900 dark:text-indigo-100",
    ringColor: "ring-indigo-500/20",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle,
    color: "bg-gradient-to-br from-green-500 to-emerald-600",
    dotColor: "bg-green-500",
    borderColor: "border-green-200 dark:border-green-800",
    bgLight: "bg-green-50 dark:bg-green-950/30",
    textColor: "text-green-900 dark:text-green-100",
    ringColor: "ring-green-500/20",
  },
  closed: {
    label: "Closed",
    icon: CheckCircle2,
    color: "bg-gradient-to-br from-slate-500 to-gray-600",
    dotColor: "bg-slate-500",
    borderColor: "border-slate-200 dark:border-slate-700",
    bgLight: "bg-slate-50 dark:bg-slate-950/30",
    textColor: "text-slate-900 dark:text-slate-100",
    ringColor: "ring-slate-500/20",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    color: "bg-gradient-to-br from-red-500 to-rose-600",
    dotColor: "bg-red-500",
    borderColor: "border-red-200 dark:border-red-800",
    bgLight: "bg-red-50 dark:bg-red-950/30",
    textColor: "text-red-900 dark:text-red-100",
    ringColor: "ring-red-500/20",
  },
};

const COMPLAINT_PRIORITY_CONFIG = {
  low: {
    label: "Low Priority",
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    icon: TrendingUp,
    borderColor: "border-slate-300 dark:border-slate-600",
  },
  medium: {
    label: "Medium Priority",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
    icon: AlertCircle,
    borderColor: "border-amber-300 dark:border-amber-600",
  },
  high: {
    label: "High Priority",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200",
    icon: Zap,
    borderColor: "border-orange-300 dark:border-orange-600",
  },
  urgent: {
    label: "Urgent",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
    icon: AlertCircle,
    borderColor: "border-red-300 dark:border-red-600",
  },
};

function DetailSkeleton() {
    return (
        <div className="min-h-screen bg-muted/10 p-4 md:p-8 animate-pulse">
            <div className="h-64 bg-muted rounded-3xl mb-8" />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-8">
                    <div className="h-40 bg-muted rounded-3xl" />
                    <div className="h-96 bg-muted rounded-3xl" />
                </div>
                <div className="h-96 bg-muted rounded-3xl" />
            </div>
        </div>
    )
}

export default function ComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const complaintId = params.id as string;
  const supabase = createClient();

  const { data: user } = useCurrentUser();
  const { 
    data: complaint, 
    isLoading, 
    isRefetching, 
    refetch 
  } = useComplaint(complaintId);

  const [activeView, setActiveView] = useState<"overview" | "timeline" | "communication">("overview");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Real-time Subscriptions
  useEffect(() => {
    if (!complaintId) return;

    const channel = supabase.channel(`complaint-detail-${complaintId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "complaints", filter: `id=eq.${complaintId}` },
        () => {
          toast.info("Complaint updated");
          refetch();
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "complaint_comments", filter: `complaint_id=eq.${complaintId}` },
        () => {
          toast.success("New comment received");
          refetch();
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "complaint_status_history", filter: `complaint_id=eq.${complaintId}` },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [complaintId, refetch, supabase]);

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
    const daysRemaining = Math.max(0, Math.ceil((due - Date.now()) / (24 * 60 * 60 * 1000)));

    return { isResolved, isOverdue, slaProgress, due, daysRemaining };
  }, [complaint]);

  const workPhotos = useMemo(() => {
      if(!complaint?.workLogs) return [];
      // Flatten urls from work logs
      return (complaint.workLogs as any[]).flatMap(log => log.photo_urls || []);
  }, [complaint]);

  if (isLoading) return <DetailSkeleton />;

  if (!complaint) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/10">
        <div className="text-center space-y-6 max-w-md bg-card p-12 rounded-3xl border shadow-lg">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
            <AlertCircle className="h-20 w-20 text-red-600 dark:text-red-400 mx-auto relative" strokeWidth={1.5} />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold">Complaint Not Found</h2>
            <p className="text-muted-foreground leading-relaxed">
              The requested complaint could not be found or may have been removed
            </p>
          </div>
          <Button
            onClick={() => router.push("/citizen/complaints")}
            className="gap-2 px-6 py-6 text-base rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Complaints
          </Button>
        </div>
      </div>
    );
  }

 const statusConfig =
  COMPLAINT_STATUS_CONFIG[complaint.status as keyof typeof COMPLAINT_STATUS_CONFIG] || {
    // FIX: Use optional chaining and a fallback string
    label: (complaint.status || "unknown").charAt(0).toUpperCase() + (complaint.status || "unknown").slice(1),
    icon: AlertCircle,
    color: "bg-gradient-to-br from-gray-500 to-gray-600",
    dotColor: "bg-gray-500",
    borderColor: "border-gray-200 dark:border-gray-700",
    bgLight: "bg-gray-50 dark:bg-gray-950/30",
    textColor: "text-gray-900 dark:text-gray-100",
    ringColor: "ring-gray-500/20",
  };
 const priorityConfig =
  COMPLAINT_PRIORITY_CONFIG[complaint.priority as keyof typeof COMPLAINT_PRIORITY_CONFIG] || {
    // FIX: Safely handle undefined/null priority
    label: (complaint.priority || "Normal").charAt(0).toUpperCase() + 
           (complaint.priority || "Normal").slice(1) + " Priority",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200",
    icon: AlertCircle,
    borderColor: "border-gray-300 dark:border-gray-600",
  };

  const StatusIcon = statusConfig.icon || AlertCircle;
  const assignedStaff = complaint.assigned_staff_profile;

  return (
    <div className="min-h-screen bg-muted/10 pb-20">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden border-b bg-card">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-transparent" />
        
        <div className="relative container mx-auto max-w-7xl px-4 py-8 lg:py-12">
          {/* Back Navigation */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="gap-2 hover:gap-3 transition-all -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">Back to Complaints</span>
            </Button>
          </div>

          {/* Title Section */}
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1 space-y-4">
                {/* Status Badge */}
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className={cn(
                    "px-4 py-2 text-white border-0 shadow-lg rounded-xl font-semibold text-sm",
                    statusConfig.color
                  )}>
                    <StatusIcon className="w-4 h-4 mr-2" />
                    {statusConfig.label}
                  </Badge>
                  <Badge variant="outline" className={cn(
                    "px-4 py-2 border-2 rounded-xl font-semibold text-sm",
                    priorityConfig.color,
                    priorityConfig.borderColor
                  )}>
                    <priorityConfig.icon className="w-4 h-4 mr-2" />
                    {priorityConfig.label}
                  </Badge>
                </div>

                {/* Title */}
                <div className="space-y-3">
                  <h1 className="text-3xl lg:text-4xl font-bold leading-tight text-foreground">
                    {complaint.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border">
                      <FileCheck className="w-4 h-4 text-primary" />
                      <span className="font-mono font-semibold">
                        {complaint.tracking_code}
                      </span>
                    </div>
                    <span className="text-muted-foreground/50">•</span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
  Updated {complaint.updated_at && !isNaN(new Date(complaint.updated_at).getTime()) 
    ? formatDistanceToNow(new Date(complaint.updated_at)) 
    : "recently"} ago
</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => refetch()}
                  disabled={isRefetching}
                  className="rounded-xl border-2 font-bold"
                >
                  <RefreshCw className={cn("w-4 h-4 mr-2", isRefetching && "animate-spin")} />
                  Refresh
                </Button>
                <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={() => window.print()} 
                    className="rounded-xl border-2 font-bold"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Category",
                  value: complaint.category?.name || "Uncategorized",
                  icon: FileText,
                  color: "text-blue-600 dark:text-blue-400",
                  bgColor: "bg-blue-50 dark:bg-blue-950/50",
                },
                {
                  label: "Department",
                  value: complaint.department?.name || "Pending Assignment",
                  icon: Building2,
                  color: "text-purple-600 dark:text-purple-400",
                  bgColor: "bg-purple-50 dark:bg-purple-950/50",
                },
                {
                  label: "Submitted",
                  value: format(new Date(complaint.submitted_at), "MMM dd, yyyy"),
                  icon: Calendar,
                  color: "text-green-600 dark:text-green-400",
                  bgColor: "bg-green-50 dark:bg-green-950/50",
                },
                {
                  label: "Location",
                  value: `Ward ${complaint.ward?.ward_number || "N/A"}`,
                  icon: MapPin,
                  color: "text-orange-600 dark:text-orange-400",
                  bgColor: "bg-orange-50 dark:bg-orange-950/50",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="group bg-card hover:shadow-xl transition-all duration-300 rounded-2xl p-5 border"
                >
                  <div className="flex items-start gap-4">
                    <div className={cn("p-3 rounded-xl shadow-sm", item.bgColor)}>
                      <item.icon className={cn("w-5 h-5", item.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        {item.label}
                      </p>
                      <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                        {item.value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* View Tabs */}
        <div className="bg-card rounded-2xl p-2 shadow-lg inline-flex gap-1 border">
          {[
            { id: "overview", label: "Overview", icon: convertToIcon(FileText) },
            { id: "timeline", label: "Timeline", icon: convertToIcon(BarChart3) },
            { id: "communication", label: "Communication", icon: convertToIcon(MessageSquare) },
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as any)}
              className={cn(
                "px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2",
                activeView === view.id
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {view.icon}
              {view.label}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="xl:col-span-2 space-y-8">
            {activeView === "overview" && (
              <>
                {/* Description Card */}
                <div className="bg-card rounded-3xl overflow-hidden shadow-xl border">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                    <h3 className="font-bold text-white flex items-center gap-2 text-lg">
                      <FileText className="w-5 h-5" />
                      Complaint Description
                    </h3>
                  </div>
                  <div className="p-8">
                    <p className="text-muted-foreground leading-relaxed text-base whitespace-pre-wrap">
                      {complaint.description}
                    </p>
                  </div>
                </div>

                {/* Attachments */}
                {(complaint.attachments || []).length > 0 && (
                  <div className="bg-card rounded-3xl overflow-hidden shadow-xl border">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
                      <h3 className="font-bold text-white flex items-center gap-2 text-lg">
                        <Paperclip className="w-5 h-5" />
                        Evidence Photos ({complaint.attachments.length})
                      </h3>
                    </div>
                    <div className="p-8">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {complaint.attachments.map((file: any, idx: number) => (
                          <div
                            key={file.id}
                            className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-border cursor-pointer hover:border-primary transition-all duration-300 hover:shadow-2xl hover:scale-105"
                            onClick={() => setSelectedImage(file.file_path)}
                          >
                            <img
                              src={file.file_path}
                              alt={`Evidence ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-center">
                                <Eye className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Staff Work Photos Section */}
                {workPhotos.length > 0 && (
                  <div className="bg-card rounded-3xl overflow-hidden shadow-xl border">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
                      <h3 className="font-bold text-white flex items-center gap-2 text-lg">
                        <Camera className="w-5 h-5" />
                        Staff Work Photos ({workPhotos.length})
                      </h3>
                      <p className="text-white/80 text-xs mt-1">
                        Photos taken by staff during resolution
                      </p>
                    </div>
                    <div className="p-8">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {workPhotos.map((photoUrl: string, idx: number) => (
                          <div
                            key={idx}
                            className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-emerald-200 dark:border-emerald-800 cursor-pointer hover:border-emerald-500 transition-all duration-300 hover:shadow-2xl hover:scale-105"
                            onClick={() => setSelectedImage(photoUrl)}
                          >
                            <img
                              src={photoUrl}
                              alt={`Work photo ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col items-center justify-center gap-2">
                                <ImageIcon className="w-6 h-6 text-white" />
                                <span className="text-xs text-white font-semibold">Work Photo {idx + 1}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SLA Timeline */}
                <div className="bg-card rounded-3xl overflow-hidden shadow-xl border">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                    <h3 className="font-bold text-white flex items-center gap-2 text-lg">
                      <Clock className="w-5 h-5" />
                      Resolution Timeline
                    </h3>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-muted-foreground">Due Date</span>
                      <span className="font-bold">
                        {format(computed!.due, "MMMM dd, yyyy")}
                      </span>
                    </div>
                    {!computed?.isResolved && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-muted-foreground">Time Remaining</span>
                        <span
                          className={cn(
                            "font-bold text-lg",
                            computed?.isOverdue
                              ? "text-red-600 dark:text-red-400"
                              : computed!.daysRemaining <= 2
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-green-600 dark:text-green-400"
                          )}
                        >
                          {computed?.isOverdue ? "Overdue!" : `${computed!.daysRemaining} days`}
                        </span>
                      </div>
                    )}
                    <div className="space-y-3">
                      <Progress value={computed?.slaProgress} className="h-3 rounded-full" />
                      <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                        <span>Submitted</span>
                        <span>{Math.round(computed?.slaProgress || 0)}% Complete</span>
                        <span>Due</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeView === "timeline" && (
              <div className="bg-card rounded-3xl overflow-hidden shadow-xl border">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                  <h3 className="font-bold text-white flex items-center gap-2 text-lg">
                    <BarChart3 className="w-5 h-5" />
                    Status History
                  </h3>
                </div>
                <div className="p-8">
                  <div className="space-y-8">
                    {(complaint.history || []).map((h: any, i: number) => {
                      const isLast = i === (complaint.history?.length || 0) - 1;
                      const config =
                        COMPLAINT_STATUS_CONFIG[h.new_status as keyof typeof COMPLAINT_STATUS_CONFIG] || {
                          label: h.new_status.charAt(0).toUpperCase() + h.new_status.slice(1),
                          icon: AlertCircle,
                          color: "bg-gradient-to-br from-gray-500 to-gray-600",
                          dotColor: "bg-gray-500",
                        };
                      const Icon = config.icon || Activity;

                      return (
                        <div key={i} className="relative flex gap-6">
                          <div className="flex flex-col items-center">
                            <div
                              className={cn(
                                "h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg",
                                config.color
                              )}
                            >
                              <Icon className="h-7 w-7" />
                            </div>
                            {!isLast && (
                              <div className="w-1 flex-1 bg-gradient-to-b from-border to-transparent mt-3 rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 pb-8">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-bold text-lg capitalize">
                                {h.new_status.replace(/_/g, " ")}
                              </h4>
                              <span className="text-xs font-mono font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-lg">
                                {format(new Date(h.created_at), "MMM dd, HH:mm")}
                              </span>
                            </div>
                            {h.note && (
                              <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 p-4 rounded-xl border">
                                {h.note}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeView === "communication" && (
              <>
                {assignedStaff && user?.id ? (
                  <div className="space-y-8">
                    <CitizenStaffCommunication
                      complaintId={complaintId}
                      currentUserId={user.id}
                      userRole="citizen"
                      assignedStaffName={
                        assignedStaff.full_name ||
                        "Assigned Staff"
                      }
                      citizenName={complaint.citizen?.profile?.full_name || "Citizen"}
                    />

                    {complaint.assigned_department_id && (
                      <div className="pt-8 border-t-2 border-dashed">
                        <div className="flex items-center gap-3 mb-6 px-2">
                          <Shield className="w-5 h-5 text-muted-foreground" />
                          <span className="font-semibold">
                            Department Supervisor Communication
                          </span>
                        </div>
                        <StaffCommunication
                          complaintId={complaintId}
                          currentUserId={user.id}
                          isStaff={false}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-card rounded-3xl overflow-hidden shadow-xl border">
                    <div className="p-16 text-center">
                      <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
                        <div className="relative">
                          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 flex items-center justify-center">
                            <MessageSquare className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h3 className="font-bold text-xl">
                            Communication Unavailable
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            Once your complaint is assigned to a staff member, you'll be able to
                            communicate directly with them here.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar Column - Only Assigned Staff Info */}
          <div className="space-y-6">
            {/* Assigned Staff Details */}
            <div className="bg-card rounded-3xl overflow-hidden shadow-xl border">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Assigned Staff Member
                </h3>
              </div>
              <div className="p-6">
                {assignedStaff ? (
                  <div className="space-y-6">
                    {/* Staff Avatar and Basic Info */}
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg flex-shrink-0">
                        {assignedStaff.full_name?.charAt(0) || "S"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xl truncate mb-1">
                          {assignedStaff.full_name ||
                            "Assigned Staff"}
                        </p>
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                          <BadgeCheck className="w-3.5 h-3.5" />
                          {assignedStaff.staff?.staff_role?.replace(/_/g, " ") || "Staff Member"}
                        </p>
                      </div>
                    </div>

                    {/* Staff ID */}
                    {assignedStaff.staff?.staff_code && (
                      <div className="bg-muted/50 p-4 rounded-xl border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-muted-foreground">Staff ID</span>
                          <span className="font-mono font-bold text-lg">
                            {assignedStaff.staff.staff_code}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                    <div className="text-center py-6 text-muted-foreground">
                        <p>No staff assigned yet.</p>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
        {selectedImage && (
            <div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={() => setSelectedImage(null)}
            >
                <div className="relative max-w-4xl max-h-[90vh] w-full">
                    <button 
                        onClick={() => setSelectedImage(null)}
                        className="absolute -top-12 right-0 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <XCircle className="w-8 h-8" />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Preview"
                        className="w-full h-full object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            </div>
        )}
    </div>
  );
}

function convertToIcon(LuIcon: any) {
    return <LuIcon className="w-4 h-4" />
}