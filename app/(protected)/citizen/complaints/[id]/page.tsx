// app/citizen/complaints/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Button } from "@/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Separator } from "@/ui//separator";
import { Badge } from "@/ui/badge";
import { Skeleton } from "@/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import {
  ArrowLeft,
  RefreshCw,
  Printer,
  Share2,
  Download,
  AlertCircle,
  Clock,
  MapPin,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

// Import components
import { ComplaintHeader } from "@/components/citizen/complaints/ComplaintHeader";
import { ComplaintDetails } from "@/components/citizen/complaints/ComplaintDetails";
import { StatusTimeline } from "@/components/citizen/complaints/StatusTimeline";
import { AssignmentInfo } from "@/components/citizen/complaints/AssignmentInfo";
import { AttachmentsGallery } from "@/components/citizen/complaints/AttachmentsGallery";
import { StaffUpdates } from "@/components/citizen/complaints/StaffUpdates";
import { CommentThread } from "@/components/citizen/complaints/CommentThread";
import { FeedbackForm } from "@/components/citizen/complaints/FeedbackForm";

// Import services
import { complaintsService } from "@/lib/supabase/queries/complaints";
import type {
  Complaint,
  ComplaintComment,
  ComplaintStatusHistory,
} from "@/lib/supabase/queries/complaints";

export default function ComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [complaint, setComplaint] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time data
  const [comments, setComments] = useState<ComplaintComment[]>([]);
  const [statusHistory, setStatusHistory] = useState<ComplaintStatusHistory[]>(
    []
  );
  const [attachments, setAttachments] = useState<any[]>([]);

  // Subscriptions
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  const complaintId = params.id as string;

  // Fetch initial data
  useEffect(() => {
    if (complaintId) {
      fetchComplaintData();
      setupSubscriptions();
    }

    return () => {
      // Clean up subscriptions
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
  }, [complaintId]);

  const fetchComplaintData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Verify user can view this complaint
      const canView = await complaintsService.canViewComplaint(complaintId);
      if (!canView) {
        toast.error("Access Denied", {
          description: "You do not have permission to view this complaint",
        });
        router.push("/citizen/complaints");
        return;
      }

      // Fetch complaint with all relations
      const complaintData =
        await complaintsService.getComplaintById(complaintId);
      if (!complaintData) {
        throw new Error("Complaint not found");
      }

      setComplaint(complaintData);
      setComments(complaintData.comments || []);
      setStatusHistory(complaintData.status_history || []);
      setAttachments(complaintData.attachments || []);
    } catch (err: any) {
      console.error("Error fetching complaint:", err);
      setError(err.message || "Failed to load complaint details");
      toast.error("Error loading complaint", {
        description: err.message || "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setupSubscriptions = () => {
    // Subscribe to complaint updates
    const complaintSub = complaintsService.subscribeToComplaint(
      complaintId,
      (payload) => {
        console.log("Complaint updated:", payload);

        if (payload.eventType === "UPDATE") {
          // Update complaint data
          setComplaint((prev: any) => ({
            ...prev,
            ...payload.new,
            updated_at: new Date().toISOString(),
          }));

          // Show notification for status changes
          if (payload.new.status !== payload.old?.status) {
            toast.info("Status Updated", {
              description: `Complaint status changed to ${payload.new.status}`,
            });
          }
        }
      }
    );

    // Subscribe to comments
    const commentSub = complaintsService.subscribeToComments(
      complaintId,
      (payload) => {
        console.log("New comment:", payload);

        if (payload.eventType === "INSERT") {
          setComments((prev) => [...prev, payload.new]);

          // Show notification for staff comments
          if (payload.new.author_role === "staff") {
            toast.info("New Staff Comment", {
              description: "Staff has posted an update on your complaint",
            });
          }
        }
      }
    );

    // Subscribe to status history
    const statusSub = complaintsService.subscribeToStatus(
      complaintId,
      (payload) => {
        console.log("Status history update:", payload);

        if (payload.eventType === "INSERT") {
          setStatusHistory((prev) => [...prev, payload.new]);
        }
      }
    );

    setSubscriptions([complaintSub, commentSub, statusSub]);
    setIsSubscribed(true);
  };

  const handlePrint = () => {
    const printWindow = window.open(
      `/citizen/complaints/${complaintId}/print`,
      "_blank"
    );
    if (printWindow) {
      printWindow.focus();
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/citizen/complaints/${complaintId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Complaint: ${complaint?.title}`,
          text: `Check out this complaint: ${complaint?.title}`,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
    }
  };

  const handleDownloadDetails = () => {
    if (!complaint) return;

    const content = `
Complaint Details
=================
Tracking Code: ${complaint.tracking_code}
Title: ${complaint.title}
Status: ${complaint.status}
Category: ${complaint.category?.name || "N/A"}
Subcategory: ${complaint.subcategory?.name || "N/A"}
Ward: Ward ${complaint.ward?.ward_number || "N/A"} - ${
      complaint.ward?.name || "N/A"
    }
Address: ${complaint.address_text || "N/A"}
Submitted: ${new Date(complaint.submitted_at).toLocaleDateString()}
Last Updated: ${new Date(complaint.updated_at).toLocaleDateString()}

Description:
${complaint.description}

${
  statusHistory.length > 0
    ? "Status History:\n" +
      statusHistory
        .map(
          (h) =>
            `  ${new Date(h.created_at).toLocaleDateString()}: ${
              h.old_status || "Created"
            } → ${h.new_status}`
        )
        .join("\n")
    : ""
}

${
  comments.length > 0
    ? "Comments:\n" +
      comments
        .map(
          (c) =>
            `  ${new Date(c.created_at).toLocaleDateString()} ${
              c.author_role === "staff" ? "[Staff]" : "[You]"
            }: ${c.content}`
        )
        .join("\n")
    : ""
}
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `complaint_${complaint.tracking_code}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Details downloaded");
  };

  const handleRefresh = () => {
    fetchComplaintData();
    toast.success("Complaint details refreshed");
  };

  const handleNewComment = (comment: ComplaintComment) => {
    setComments((prev) => [...prev, comment]);
  };

  const handleFeedbackSubmit = () => {
    // Refresh complaint data after feedback submission
    fetchComplaintData();
    toast.success("Thank you for your feedback!");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/citizen/complaints")}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Complaints
          </Button>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Complaint</AlertTitle>
            <AlertDescription>
              {error || "Complaint not found"}
            </AlertDescription>
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => router.push("/citizen/complaints")}
              >
                View All Complaints
              </Button>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Actions */}
      <div className="mb-8">
        <ComplaintHeader
          complaint={complaint}
          onBack={() => router.push("/citizen/complaints")}
        />

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
          <div className="flex items-center gap-2">
            {isSubscribed && (
              <Badge variant="outline" className="animate-pulse">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                Live Updates
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadDetails}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="updates">Staff Updates</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="attachments">
            Attachments ({attachments.length})
          </TabsTrigger>
          {(complaint.status === "resolved" ||
            complaint.status === "closed") && (
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <ComplaintDetails
                complaint={complaint}
                showPriority={true}
                showContactInfo={true}
              />

              <StaffUpdates
                updates={comments}
                isSubscribed={isSubscribed}
                isLoading={false}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <StatusTimeline
                complaint={complaint}
                updates={statusHistory}
                isSubscribed={isSubscribed}
              />

              <AssignmentInfo
                complaint={complaint}
                onContact={() => {
                  // Contact functionality
                  toast.info("Contact functionality would open here");
                }}
              />
            </div>
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <StatusTimeline
                complaint={complaint}
                updates={statusHistory}
                isSubscribed={isSubscribed}
              />
            </div>

            <div className="space-y-6">
              <AssignmentInfo
                complaint={complaint}
                onContact={() => {
                  toast.info("Contact functionality would open here");
                }}
              />

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">Key Dates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="h-4 w-4" />
                      <span>Submitted</span>
                    </div>
                    <div className="font-medium">
                      {new Date(complaint.submitted_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="h-4 w-4" />
                      <span>Last Updated</span>
                    </div>
                    <div className="font-medium">
                      {new Date(complaint.updated_at).toLocaleDateString()}
                    </div>
                  </div>

                  {complaint.assigned_at && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="h-4 w-4" />
                        <span>Assigned</span>
                      </div>
                      <div className="font-medium">
                        {new Date(complaint.assigned_at).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {complaint.resolved_at && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="h-4 w-4" />
                        <span>Resolved</span>
                      </div>
                      <div className="font-medium">
                        {new Date(complaint.resolved_at).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Staff Updates Tab */}
        <TabsContent value="updates">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <StaffUpdates
                updates={comments}
                isSubscribed={isSubscribed}
                isLoading={false}
              />
            </div>

            <div className="space-y-6">
              <StatusTimeline
                complaint={complaint}
                updates={statusHistory}
                isSubscribed={isSubscribed}
              />

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">Response Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-slate-500 mt-0.5" />
                      <span>Staff typically respond within 24-48 hours</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-slate-500 mt-0.5" />
                      <span>
                        Updates are posted during business hours (9 AM - 5 PM)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-slate-500 mt-0.5" />
                      <span>
                        You'll be notified when staff post new updates
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CommentThread
                complaintId={complaintId}
                comments={comments}
                isSubscribed={isSubscribed}
                onNewComment={handleNewComment}
              />
            </div>

            <div className="space-y-6">
              <StaffUpdates
                updates={comments}
                isSubscribed={isSubscribed}
                isLoading={false}
              />

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">Comment Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-600">Use comments to:</p>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>Ask questions about the progress</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>Provide additional information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>Request clarification from staff</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>Share updates or changes to the issue</span>
                    </li>
                  </ul>
                  <Separator className="my-3" />
                  <p className="text-xs text-slate-500">
                    Note: All comments are public and visible to the assigned
                    staff.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Attachments Tab */}
        <TabsContent value="attachments">
          <AttachmentsGallery attachments={attachments} isLoading={false} />

          <Separator className="my-6" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">Upload Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-600">
                    You can upload additional files to help staff understand
                    your complaint better:
                  </p>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 font-bold">✓</span>
                      <span>Photos of the issue (JPG, PNG, GIF)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 font-bold">✓</span>
                      <span>Documents (PDF, DOC, DOCX)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 font-bold">✓</span>
                      <span>Videos (MP4, MOV)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">✗</span>
                      <span>Large files (max 10MB each)</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  toast.info("File upload functionality would open here");
                }}
              >
                Upload Additional Files
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Feedback Tab (only for resolved/closed complaints) */}
        {(complaint.status === "resolved" || complaint.status === "closed") && (
          <TabsContent value="feedback">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <FeedbackForm
                  complaintId={complaintId}
                  complaintStatus={complaint.status}
                  onSubmitSuccess={handleFeedbackSubmit}
                />
              </div>

              <div className="space-y-6">
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Why Feedback Matters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ul className="space-y-3 text-sm text-slate-600">
                      <li className="flex items-start gap-2">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-bold">1</span>
                        </div>
                        <span>Helps us improve our services</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-bold">2</span>
                        </div>
                        <span>Recognizes staff who did great work</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-bold">3</span>
                        </div>
                        <span>
                          Guides resource allocation for future issues
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-bold">4</span>
                        </div>
                        <span>Makes our municipality more responsive</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Your Complaint Journey
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">
                          Days to resolution
                        </span>
                        <span className="font-medium">
                          {complaint.actual_resolution_days ||
                            Math.ceil(
                              (new Date(
                                complaint.resolved_at || complaint.updated_at
                              ).getTime() -
                                new Date(complaint.submitted_at).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )}{" "}
                          days
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">
                          Status updates
                        </span>
                        <span className="font-medium">
                          {statusHistory.length}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">
                          Comments exchanged
                        </span>
                        <span className="font-medium">{comments.length}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">
                          Attachments
                        </span>
                        <span className="font-medium">
                          {attachments.length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
