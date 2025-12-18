// app/(protected)/citizen/complaints/[id]/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// UI
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// Custom
import { CommentThread } from "@/components/citizen/complaints/CommentThread";
import { FeedbackForm } from "@/components/citizen/complaints/FeedbackForm";

// Services & Types (UNCHANGED)
import { complaintsService } from "@/lib/supabase/queries/complaints";
import type {
  ComplaintComment,
  ComplaintStatusHistory,
} from "@/lib/supabase/queries/complaints";

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
  // Keep visual progress sane for terminal/edge statuses
  if (status === "closed") return PROGRESS_STEPS.length - 1;
  if (status === "rejected") return 0;
  if (status === "under_review") return 0;
  if (status === "reopened") return 2;

  const idx = PROGRESS_STEPS.findIndex((s) => s.id === status);
  return idx === -1 ? 0 : idx;
};

const getCategoryIcon = (name: string | null | undefined) => {
  const lower = (name || "").toLowerCase();
  if (lower.includes("water") || lower.includes("leak")) return <Droplets className="h-6 w-6" />;
  if (lower.includes("electric") || lower.includes("light")) return <Lightbulb className="h-6 w-6" />;
  if (lower.includes("waste") || lower.includes("trash")) return <Trash2 className="h-6 w-6" />;
  if (lower.includes("road") || lower.includes("pothole")) return <Construction className="h-6 w-6" />;
  if (lower.includes("tree") || lower.includes("garden")) return <Trees className="h-6 w-6" />;
  if (lower.includes("noise")) return <Volume2 className="h-6 w-6" />;
  return <FileText className="h-6 w-6" />;
};

const getStatusPill = (status: string) => {
  switch (status) {
    case "resolved":
      return "border-green-300 bg-green-50 text-green-700";
    case "closed":
      return "border-slate-300 bg-slate-50 text-slate-700";
    case "rejected":
      return "border-red-300 bg-red-50 text-red-700";
    case "in_progress":
      return "border-blue-300 bg-blue-50 text-blue-700";
    case "assigned":
      return "border-indigo-300 bg-indigo-50 text-indigo-700";
    default:
      return "border-amber-300 bg-amber-50 text-amber-700";
  }
};

const formatName = (name: string | null | undefined) => {
  if (!name) return "N/A";
  if (name.includes("-")) return name.split("-").pop()?.trim();
  return name;
};

// ----------------------------------------------------------------------
// HELPER COMPONENTS
// ----------------------------------------------------------------------

function GradientActionButton({
  children,
  disabled,
  onClick,
  title,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative group overflow-hidden rounded-xl bg-blue-600 p-[2px] transition-all duration-300",
        "hover:shadow-xl hover:shadow-blue-600/20 disabled:opacity-60 disabled:hover:shadow-none"
      )}
    >
      <div className="relative flex items-center justify-center gap-2 bg-blue-600 rounded-[10px] px-3 py-2 text-white font-semibold group-hover:bg-blue-700">
        {children}
      </div>
    </button>
  );
}

const AttachmentPreview = ({ file }: { file: any }) => {
  // Robust URL generation (unchanged behavior)
  let fileUrl = file.file_path;
  if (file.file_path && !file.file_path.startsWith("http")) {
    fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/complaint-attachments/${file.file_path}`;
  } else if (file.url) {
    fileUrl = file.url;
  }

  const isImage =
    file.file_type?.includes("image") ||
    file.file_name?.match(/\.(jpg|jpeg|png|gif|webp)/i) ||
    fileUrl?.match(/\.(jpg|jpeg|png|gif|webp)/i);

  const handleImageError = (e: any) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://placehold.co/800x800?text=Image+Error";
  };

  const metaLine = `${file.file_size ? (file.file_size / 1024).toFixed(1) + " KB" : "Unknown Size"} • ${
    file.created_at ? format(new Date(file.created_at), "PPP p") : "Just now"
  }`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group relative flex-shrink-0 w-32 h-32 rounded-2xl border-2 border-slate-200 bg-white overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg">
          {isImage ? (
            <img
              src={fileUrl}
              alt={file.file_name}
              onError={handleImageError}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-slate-400 group-hover:text-blue-600 transition-colors">
              <FileText className="h-8 w-8 mb-2" />
              <span className="text-[10px] text-center font-medium line-clamp-2 px-1 break-words w-full">
                {file.file_name}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          {isImage && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
              <p className="text-[10px] text-white truncate">{file.file_name}</p>
            </div>
          )}
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-transparent border-none shadow-none">
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border-2 border-slate-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 truncate max-w-md">{file.file_name}</h3>
              <p className="text-xs text-slate-500">{metaLine}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild className="rounded-xl border-2">
                <a href={fileUrl} download target="_blank" rel="noreferrer">
                  <Download className="h-4 w-4 mr-2" /> Download
                </a>
              </Button>
              <Button size="sm" asChild className="rounded-xl">
                <a href={fileUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" /> Open
                </a>
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-slate-50 flex items-center justify-center p-4 min-h-[300px]">
            {isImage ? (
              <img
                src={fileUrl}
                alt={file.file_name}
                onError={handleImageError}
                className="max-w-full max-h-full object-contain shadow-sm rounded-xl border-2 border-slate-200 bg-white"
              />
            ) : (
              <div className="text-center py-10">
                <FileText className="h-24 w-24 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">Preview not available</p>
                <p className="text-slate-500 text-sm mt-1">This file type can’t be previewed here.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const WorkProofGallery = ({ attachments, hasNotes }: { attachments: any[]; hasNotes: boolean }) => {
  if (!attachments || attachments.length === 0) {
    if (hasNotes) return null;
    return (
      <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center">
        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
          <Construction className="h-5 w-5 text-slate-400" />
        </div>
        <p className="text-sm font-semibold text-slate-900">No resolution evidence</p>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">Visual proof hasn&apos;t been uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          Proof of Work
        </h4>
        <Badge variant="secondary" className="text-[10px] rounded-lg">
          {attachments.length} Photo{attachments.length !== 1 ? "s" : ""}
        </Badge>
      </div>
      <ScrollArea className="w-full whitespace-nowrap pb-2">
        <div className="flex gap-3">
          {attachments.map((file) => (
            <AttachmentPreview key={file.id || file.file_path || file.file_name} file={file} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

const EmptyTimeline = () => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
      <Clock className="h-6 w-6 text-slate-400" />
    </div>
    <p className="text-sm font-semibold text-slate-900">No history yet</p>
    <p className="text-xs text-slate-500 max-w-[220px] mt-1">
      Timeline updates will appear here as your complaint is processed.
    </p>
  </div>
);

// ----------------------------------------------------------------------
// MAIN PAGE
// ----------------------------------------------------------------------

export default function ComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const complaintId = params.id as string;

  const [complaint, setComplaint] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [comments, setComments] = useState<ComplaintComment[]>([]);
  const [statusHistory, setStatusHistory] = useState<ComplaintStatusHistory[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complaintId]);

  const cleanupSubscriptions = () => {
    subsRef.current.forEach((sub) => sub.unsubscribe());
    subsRef.current = [];
    setIsSubscribed(false);
  };

  const fetchComplaintData = async (isBackgroundRefresh = false) => {
    if (!isBackgroundRefresh) setIsLoading(true);
    setError(null);

    try {
      const canView = await complaintsService.canViewComplaint(complaintId);
      if (!canView) {
        toast.error("Access Denied", {
          description: "You don't have permission to view this complaint.",
        });
        router.push("/citizen/complaints");
        return;
      }

      const data = await complaintsService.getComplaintById(complaintId);
      if (!data) throw new Error("Complaint not found");

      setComplaint(data);
      setComments(data.comments || []);
      setStatusHistory(data.status_history || []);
      setAttachments(data.attachments || []);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError(err.message || "Failed to load data");
    } finally {
      if (!isBackgroundRefresh) setIsLoading(false);
    }
  };

  const setupSubscriptions = () => {
    cleanupSubscriptions();

    const sub1 = complaintsService.subscribeToComplaint(complaintId, (payload) => {
      if (payload.eventType === "UPDATE") {
        setComplaint((prev: any) => ({ ...prev, ...payload.new }));
        setLastUpdated(new Date());

        if (payload.new.status !== payload.old?.status) {
          toast.info("Status Updated", {
            description: `Complaint status is now ${payload.new.status.replace("_", " ")}`,
            icon: <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />,
          });

          if (payload.new.status === "resolved" || payload.new.status === "closed") {
            fetchComplaintData(true);
          }
        }
      }
    });

    const sub2 = complaintsService.subscribeToComments(complaintId, (payload) => {
      if (payload.eventType === "INSERT") {
        setComments((prev) => {
          const exists = prev.some((c) => c.id === payload.new.id);
          if (exists) return prev;
          return [...prev, payload.new];
        });
      }
    });

    const sub3 = complaintsService.subscribeToStatus(complaintId, (payload) => {
      if (payload.eventType === "INSERT") {
        setStatusHistory((prev) => [...prev, payload.new]);
      }
    });

    subsRef.current = [sub1, sub2, sub3];
    setIsSubscribed(true);
  };

  // Actions
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(complaint.tracking_code);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Complaint #${complaint.tracking_code}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch (e) {
      console.error("Share failed", e);
    }
  };

  const handlePrint = () => window.print();

  const handleRefresh = () => {
    fetchComplaintData();
    toast.success("Refreshed");
  };

  const handleNewComment = (newComment: ComplaintComment) => {
    setComments((prev) => {
      const exists = prev.some((c) => c.id === newComment.id);
      if (exists) return prev;
      return [...prev, newComment];
    });
  };

  // Loading/Error
  if (isLoading) return <ComplaintSkeleton />;
  if (error || !complaint) return <ComplaintError error={error} router={router} />;

  // Computed
  const CategoryIcon = getCategoryIcon(complaint.category?.name);
  const activeStep = clamp(getStepIndex(complaint.status), 0, PROGRESS_STEPS.length - 1);
  const progressPct = (activeStep / (PROGRESS_STEPS.length - 1)) * 100;

  const submitted = new Date(complaint.submitted_at).getTime();
  const due = complaint.sla_due_at
    ? new Date(complaint.sla_due_at).getTime()
    : submitted + 3 * 24 * 60 * 60 * 1000;

  const now = new Date().getTime();
  const totalDuration = due - submitted;
  const elapsed = now - submitted;
  const slaProgress = clamp((elapsed / totalDuration) * 100, 0, 100);

  const isOverdue = now > due && !["resolved", "closed"].includes(complaint.status);
  const isResolved = ["resolved", "closed"].includes(complaint.status);

  const daysOverdue = isOverdue ? Math.floor((now - due) / (1000 * 60 * 60 * 24)) : 0;
  const daysLeft = !isOverdue ? Math.ceil((due - now) / (1000 * 60 * 60 * 24)) : 0;

  // Attachments split (logic preserved)
  const evidenceAttachments = attachments.filter(
    (a) => a.uploaded_by_role === "citizen" || !a.uploaded_by_role
  );

  const workProofAttachments = attachments.filter((a) => {
    const role = a.uploaded_by_role?.toLowerCase() || "";
    return ["staff", "ward_staff", "admin", "supervisor", "ward_officer"].includes(role);
  });

  const hasResolutionNote = !!complaint.resolution_notes;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-10">
      {/* Sticky Header (LoginForm vibe: crisp, rounded, blue accents) */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur border-b-2 border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/citizen/complaints")}
              className="rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50"
            >
              <ArrowLeft className="h-5 w-5 text-slate-700" />
            </Button>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate max-w-[220px] sm:max-w-[520px]">
                  {complaint.title}
                </h1>
                {isSubscribed && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500 font-mono">
                <span>#{complaint.tracking_code}</span>
                <button
                  onClick={handleCopyCode}
                  className="p-1 rounded-md hover:bg-slate-100 hover:text-blue-700 transition-colors"
                  aria-label="Copy tracking code"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <span className="hidden sm:inline text-slate-300">|</span>
                <span className="hidden sm:inline">Updated {formatDistanceToNow(lastUpdated)} ago</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <GradientActionButton onClick={handleRefresh} title="Refresh">
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                <span className="text-sm">Refresh</span>
              </GradientActionButton>

              <Button
                variant="outline"
                onClick={handleShare}
                className="rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>

              <Button
                variant="outline"
                onClick={handlePrint}
                className="rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>

            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-xl border-2 border-slate-200">
                    <MoreHorizontal className="h-5 w-5 text-slate-700" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleRefresh}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" /> Share
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" /> Print
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Progress Tracker */}
        <Card className="border-2 border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={cn("capitalize px-3 py-1 rounded-xl border-2", getStatusPill(complaint.status))}>
                    {complaint.status.replaceAll("_", " ")}
                  </Badge>
                  {statusHistory.length > 0 && (
                    <span className="text-xs text-slate-500">
                      Since{" "}
                      {formatDistanceToNow(
                        new Date(statusHistory[statusHistory.length - 1].created_at)
                      )}
                    </span>
                  )}
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <Badge variant="secondary" className="rounded-xl">
                  Priority: <span className="ml-1 capitalize">{complaint.priority}</span>
                </Badge>
              </div>
            </div>

            <div className="relative mb-2 mt-4">
              <div className="absolute top-1/2 left-0 w-full h-2 bg-slate-100 rounded-full -z-10" />
              <div
                className="absolute top-1/2 left-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full -z-10 transition-all duration-700 ease-out"
                style={{ width: `${clamp(progressPct, 0, 100)}%` }}
              />

              <div className="flex justify-between">
                {PROGRESS_STEPS.map((step, index) => {
                  const isCompleted = index < activeStep;
                  const isCurrent = index === activeStep;

                  return (
                    <div key={step.id} className="flex flex-col items-center relative">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center border-2 bg-white transition-all duration-300",
                          isCompleted
                            ? "border-blue-600 text-blue-600"
                            : "border-slate-300 text-slate-300",
                          isCurrent && "border-blue-600 bg-blue-600 text-white ring-4 ring-blue-100 scale-110"
                        )}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4" />
                        ) : isCurrent ? (
                          <div className="h-2.5 w-2.5 rounded-full bg-current animate-pulse" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-current" />
                        )}
                      </div>

                      <span
                        className={cn(
                          "mt-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wide",
                          index <= activeStep ? "text-slate-800" : "text-slate-400"
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            {/* Details */}
            <Card className="border-2 border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500" />
              <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-5">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border-2 border-blue-100 shadow-sm shrink-0">
                  {CategoryIcon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-slate-900">{formatName(complaint.category?.name)}</h2>
                    {complaint.subcategory && (
                      <Badge
                        variant="secondary"
                        className="font-medium text-slate-700 bg-slate-100 rounded-xl"
                      >
                        {complaint.subcategory.name}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <span
                      className={cn(
                        "flex items-center gap-1 font-semibold px-2 py-1 rounded-xl text-[10px] uppercase border-2 bg-white",
                        complaint.priority === "critical"
                          ? "border-red-200 text-red-700 bg-red-50"
                          : complaint.priority === "high"
                          ? "border-orange-200 text-orange-700 bg-orange-50"
                          : "border-slate-200 text-slate-700 bg-slate-50"
                      )}
                    >
                      {complaint.priority} Priority
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="font-medium">{format(new Date(complaint.submitted_at), "PPP p")}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="bg-white rounded-2xl border-2 border-slate-200 p-4">
                  <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                    {complaint.description}
                  </p>
                </div>

                {/* Citizen Evidence */}
                {evidenceAttachments.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Paperclip className="h-3.5 w-3.5" /> Submitted Evidence
                    </h4>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                      {evidenceAttachments.map((file) => (
                        <AttachmentPreview key={file.id || file.file_path || file.file_name} file={file} />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resolution Proof */}
            {(isResolved || workProofAttachments.length > 0) && (
              <Card className="border-2 border-green-200 bg-white shadow-sm rounded-2xl overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-500" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-green-800 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Resolution Proof
                  </CardTitle>
                  <CardDescription className="text-green-800/70">
                    Evidence and notes submitted by staff.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <WorkProofGallery attachments={workProofAttachments} hasNotes={hasResolutionNote} />

                  {complaint.resolution_notes && (
                    <div className="mt-4 bg-white rounded-2xl border-2 border-green-200 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-green-700 mb-2">
                        Staff Note
                      </p>
                      <p className="text-sm text-green-900 leading-relaxed whitespace-pre-wrap">
                        {complaint.resolution_notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tabs */}
            <Card className="border-2 border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
              <Tabs defaultValue="comments" className="w-full">
                <div className="border-b-2 border-slate-200 bg-white px-6 pt-2">
                  <TabsList className="bg-transparent h-12 gap-6 p-0 w-full justify-start">
                    <TabsTrigger
                      value="comments"
                      className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:shadow-none px-0 bg-transparent"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" /> Discussion
                      <Badge
                        variant="secondary"
                        className="ml-2 h-5 min-w-[20px] px-1 rounded-lg bg-slate-100 text-slate-700"
                      >
                        {comments.length}
                      </Badge>
                    </TabsTrigger>

                    <TabsTrigger
                      value="timeline"
                      className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:shadow-none px-0 bg-transparent"
                    >
                      <Clock className="h-4 w-4 mr-2" /> Timeline
                    </TabsTrigger>

                    {isResolved && (
                      <TabsTrigger
                        value="feedback"
                        className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:shadow-none px-0 bg-transparent"
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" /> Feedback
                      </TabsTrigger>
                    )}
                  </TabsList>
                </div>

                <div className="p-0">
                  <TabsContent value="comments" className="mt-0 p-6">
                    <CommentThread
                      complaintId={complaintId}
                      comments={comments}
                      isSubscribed={isSubscribed}
                      onNewComment={handleNewComment}
                    />
                  </TabsContent>

                  <TabsContent value="timeline" className="mt-0 p-6">
                    {statusHistory.length === 0 ? (
                      <EmptyTimeline />
                    ) : (
                      <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pl-8 py-2">
                        {statusHistory.map((h, i) => (
                          <div key={i} className="relative group">
                            <div className="absolute -left-[43px] h-8 w-8 rounded-full bg-white border-2 border-slate-200 group-hover:border-blue-500 transition-colors flex items-center justify-center">
                              <div className="h-2.5 w-2.5 rounded-full bg-slate-300 group-hover:bg-blue-500 transition-colors" />
                            </div>

                            <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 group-hover:border-blue-200 transition-colors">
                              <p className="text-sm font-semibold text-slate-900 capitalize">
                                {h.new_status.replaceAll("_", " ")}
                              </p>
                              <p className="text-xs text-slate-500 mb-3">
                                {format(new Date(h.created_at), "MMM d, yyyy • h:mm a")}
                              </p>

                              {h.note && (
                                <div className="text-sm text-slate-700 bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 italic">
                                  {h.note}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="feedback" className="mt-0 p-6">
                    <FeedbackForm
                      complaintId={complaintId}
                      complaintStatus={complaint.status}
                      onSubmitSuccess={() => fetchComplaintData(true)}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </Card>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            {/* SLA */}
            <Card className="border-2 border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
              <div
                className={cn(
                  "h-1.5",
                  isResolved ? "bg-gradient-to-r from-green-500 to-emerald-500" : isOverdue ? "bg-gradient-to-r from-red-500 to-rose-500" : "bg-gradient-to-r from-blue-500 to-indigo-500"
                )}
              />
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-slate-500">
                    {isResolved ? "Resolution Date" : "Target Resolution"}
                  </span>

                  {isOverdue && !isResolved && (
                    <Badge variant="destructive" className="text-[10px] rounded-xl">
                      Overdue
                    </Badge>
                  )}
                </div>

                <div className="text-2xl font-bold text-slate-900 mb-1">
                  {isResolved
                    ? format(new Date(complaint.resolved_at || lastUpdated), "MMM d, yyyy")
                    : daysLeft > 0
                    ? `${daysLeft} Days Left`
                    : isOverdue
                    ? `${Math.abs(daysOverdue)} Days Late`
                    : "Due Today"}
                </div>

                <p className="text-xs text-slate-500 mb-4">
                  {isResolved
                    ? "Issue successfully closed"
                    : `Due by ${complaint.sla_due_at ? format(new Date(complaint.sla_due_at), "PPP") : "Calculating..."}`}
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-medium text-slate-600">
                    <span>Progress</span>
                    <span>{isResolved ? "100%" : `${slaProgress.toFixed(0)}% Time Used`}</span>
                  </div>

                  <Progress
                    value={isResolved ? 100 : slaProgress}
                    className={cn("h-2", isOverdue ? "bg-red-100" : "bg-slate-100")}
                    indicatorClassName={
                      isResolved ? "bg-green-500" : isOverdue ? "bg-red-500" : "bg-blue-500"
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="border-2 border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 border-b-2 border-slate-200">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Location
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                <div className="flex gap-3">
                  <Building2 className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Ward {complaint.ward?.ward_number}</p>
                    <p className="text-xs text-slate-500">{complaint.ward?.name || "Unknown Zone"}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-700 leading-snug">{complaint.address_text}</p>
                    {complaint.landmark && (
                      <p className="text-xs text-slate-500 mt-1 italic">Near: {complaint.landmark}</p>
                    )}
                  </div>
                </div>

                <div className="h-32 bg-slate-50 rounded-2xl border-2 border-slate-200 flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/83.9856,28.2096,13,0,0/400x200?access_token=pk.xxx')] bg-cover opacity-40" />
                  <Button variant="outline" size="sm" className="relative z-10 rounded-xl border-2 bg-white">
                    Open Maps
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Assignment */}
            <Card className="border-2 border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 border-b-2 border-slate-200">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Assignment
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-1">Responsible Dept</p>
                  <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-500" />
                    {formatName(complaint.department?.name) || "Pending..."}
                  </p>
                </div>

                {complaint.staff ? (
                  <div className="rounded-2xl p-3 border-2 border-indigo-200 bg-indigo-50 flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                      <AvatarImage src={complaint.staff.profile?.profile_photo_url} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-700">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {complaint.staff.profile?.full_name || "Staff Officer"}
                      </p>
                      <p className="text-xs text-slate-600 capitalize">
                        {complaint.staff.staff_role.replaceAll("_", " ")}
                      </p>
                    </div>
                  </div>
                ) : isResolved ? (
                  <div className="text-sm text-slate-600 italic">Resolved by Municipal Office</div>
                ) : (
                  <Alert className="bg-amber-50 border-2 border-amber-200 py-2 rounded-2xl">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800 text-xs">
                      Processing assignment...
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-200 p-3 md:hidden flex justify-around items-center z-50 safe-area-bottom">
        <Button
          variant="ghost"
          className="flex-col gap-1 h-auto py-1 text-xs text-slate-700 hover:bg-slate-50 rounded-xl"
          onClick={() =>
            document.querySelector('[value="comments"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
          }
        >
          <MessageSquare className="h-5 w-5" />
          Comment
        </Button>

        <Button
          variant="ghost"
          className="flex-col gap-1 h-auto py-1 text-xs text-slate-700 hover:bg-slate-50 rounded-xl"
          onClick={handleShare}
        >
          <Share2 className="h-5 w-5" />
          Share
        </Button>

        {isResolved ? (
          <button
            type="button"
            className="relative group overflow-hidden rounded-xl bg-blue-600 p-[2px] transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/20"
            onClick={() =>
              document.querySelector('[value="feedback"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
            }
          >
            <div className="relative flex flex-col items-center justify-center bg-blue-600 rounded-[10px] px-6 py-2 text-white font-semibold group-hover:bg-blue-700">
              <ThumbsUp className="h-5 w-5" />
              <span className="text-xs">Rate</span>
            </div>
          </button>
        ) : (
          <Button
            variant="ghost"
            className="flex-col gap-1 h-auto py-1 text-xs text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            <MapPin className="h-5 w-5" />
            Map
          </Button>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// SKELETON + ERROR (LoginForm-style: clean cards, strong borders)
// ----------------------------------------------------------------------

function ComplaintSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <Skeleton className="h-28 w-full rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-52 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function ComplaintError({ error, router }: { error: string | null; router: any }) {
  return (
    <div className="flex h-[80vh] items-center justify-center p-4 bg-slate-50 animate-in fade-in duration-500">
      <Card className="w-full max-w-md border-2 border-red-200 bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-red-500 to-rose-500" />
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4 border-2 border-red-100">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <CardTitle className="text-red-950 text-xl">Unable to Load Complaint</CardTitle>
          <CardDescription className="text-red-800/80">
            {error || "An unexpected error occurred while fetching details."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3 justify-center pt-6 pb-6">
          <Button variant="outline" onClick={() => router.back()} className="rounded-xl border-2">
            Go Back
          </Button>
          <Button className="rounded-xl bg-red-600 hover:bg-red-700 text-white" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
