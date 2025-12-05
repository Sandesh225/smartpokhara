// app/(protected)/citizen/complaints/[id]/page.tsx
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Calendar,
  Clock,
  Building,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Download,
  Star,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import ComplaintMap from "./ComplaintMap";
import { FeedbackSection } from "./feedback-section";
import { ComplaintAttachmentsSection } from "@/components/citizen/ComplaintAttachmentsSection";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

// Keep this in sync with Attachment types used in AttachmentGallery / wrapper
interface Attachment {
  id: string;
  file_name: string;
  original_file_name: string;
  file_type: "photo" | "video" | "document" | "audio";
  mime_type: string;
  file_size_bytes: number;
  signedUrl: string;
  uploaded_at: string;
  uploaded_by_user_id: string;
}

export default async function ComplaintDetailPage({ params }: PageProps) {
  // Wait for params to resolve
  const { id } = await params;

  // Guard early: if route param missing, show 404
  if (!id) {
    notFound();
  }

  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();

  // Fetch complaint details
  const { data: complaint, error: complaintError } = await supabase
    .from("complaints")
    .select(
      `
      *,
      category:complaint_categories(name),
      subcategory:complaint_subcategories(name),
      ward:wards!fk_complaints_ward(ward_number, name),
      department:departments(name, code),
      assigned_staff:users!assigned_staff_id(user_profiles(full_name))
    `
    )
    .eq("id", id)
    .single();

  if (complaintError || !complaint) {
    console.error("Error loading complaint:", complaintError);
    notFound();
  }

  // Check if user owns this complaint
  if (complaint.citizen_id !== user.id) {
    redirect("/citizen/complaints");
  }

  // Fetch attachments from database
  const { data: rawAttachments = [], error: attachmentsError } = await supabase
    .from("complaint_attachments")
    .select("*")
    .eq("complaint_id", id)
    .order("uploaded_at", { ascending: true });

  if (attachmentsError) {
    console.error("Error loading complaint attachments:", attachmentsError);
  }

  // Generate signed URLs for private attachments
  const attachmentsWithSignedUrls = await Promise.all(
    (rawAttachments || []).map(async (attachment: any) => {
      // If attachment is public, use the existing URL
      if (attachment.is_public && attachment.file_url) {
        return {
          ...attachment,
          signedUrl: attachment.file_url,
        };
      }

      // For private attachments, generate a signed URL (valid for 1 hour)
      try {
        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from(attachment.storage_bucket || "complaint-attachments")
            .createSignedUrl(attachment.storage_path, 3600); // 1 hour

        if (signedUrlError) {
          console.error("Error generating signed URL:", signedUrlError);
          return {
            ...attachment,
            signedUrl: null,
            error: signedUrlError.message,
          };
        }

        return {
          ...attachment,
          signedUrl: signedUrlData.signedUrl,
        };
      } catch (error) {
        console.error("Error processing attachment:", error);
        return {
          ...attachment,
          signedUrl: null,
          error: "Failed to load attachment",
        };
      }
    })
  );

  // Filter out any attachments that failed to load
  const attachments: Attachment[] = attachmentsWithSignedUrls.filter(
    (a): a is Attachment => Boolean(a.signedUrl)
  );

  // Fetch status history
  const { data: statusHistory = [], error: statusHistoryError } = await supabase
    .from("complaint_status_history")
    .select("*")
    .eq("complaint_id", id)
    .order("changed_at", { ascending: true });

  if (statusHistoryError) {
    console.error(
      "Error loading complaint status history:",
      statusHistoryError
    );
  }

  // Fetch feedback if exists
  const { data: feedback, error: feedbackError } = await supabase
    .from("complaint_citizen_feedback")
    .select("*")
    .eq("complaint_id", id)
    .maybeSingle();

  if (feedbackError) {
    console.error("Error loading complaint feedback:", feedbackError);
  }

  // Check if user can give feedback
  const canGiveFeedback =
    ["resolved", "closed"].includes(complaint.status) && !feedback;

  const statusBadgeConfig: Record<
    string,
    {
      variant:
        | "outline"
        | "secondary"
        | "default"
        | "success"
        | "destructive"
        | "warning";
      label: string;
      color: string;
    }
  > = {
    draft: { variant: "outline", label: "Draft", color: "text-gray-600" },
    submitted: {
      variant: "secondary",
      label: "Submitted",
      color: "text-blue-600",
    },
    received: {
      variant: "secondary",
      label: "Received",
      color: "text-blue-600",
    },
    assigned: {
      variant: "default",
      label: "Assigned",
      color: "text-indigo-600",
    },
    accepted: {
      variant: "default",
      label: "Accepted",
      color: "text-indigo-600",
    },
    in_progress: {
      variant: "default",
      label: "In Progress",
      color: "text-orange-600",
    },
    resolved: {
      variant: "success",
      label: "Resolved",
      color: "text-green-600",
    },
    closed: { variant: "success", label: "Closed", color: "text-green-600" },
    rejected: {
      variant: "destructive",
      label: "Rejected",
      color: "text-red-600",
    },
    reopened: {
      variant: "warning",
      label: "Reopened",
      color: "text-yellow-600",
    },
  };

  const priorityColors: Record<string, string> = {
    low: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    high: "bg-orange-100 text-orange-800 border-orange-200",
    urgent: "bg-red-100 text-red-800 border-red-200",
    critical: "bg-purple-100 text-purple-800 border-purple-200",
  };

  const timelineEvents = [
    { event: "Submitted", date: complaint.submitted_at, icon: Calendar },
    { event: "Received", date: complaint.received_at, icon: CheckCircle },
    { event: "Assigned", date: complaint.assigned_at, icon: User },
    { event: "In Progress", date: complaint.in_progress_at, icon: AlertCircle },
    { event: "Resolved", date: complaint.resolved_at, icon: CheckCircle },
    { event: "Closed", date: complaint.closed_at, icon: CheckCircle },
  ].filter((event) => event.date);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/citizen/complaints">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Complaints
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {complaint.title}
              <Badge
                variant={statusBadgeConfig[complaint.status]?.variant as any}
                className="ml-2"
              >
                {statusBadgeConfig[complaint.status]?.label}
              </Badge>
              {complaint.is_escalated && (
                <Badge variant="destructive">Escalated</Badge>
              )}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">
                Tracking Code: {complaint.tracking_code}
              </span>
              <Badge className={priorityColors[complaint.priority]}>
                {complaint.priority} Priority
              </Badge>
              {complaint.sla_breached && (
                <Badge variant="destructive">SLA Breached</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="attachments">
            Attachments ({attachments?.length || 0})
          </TabsTrigger>
          {feedback || canGiveFeedback ? (
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          ) : null}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Complaint Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {complaint.description}
                    </p>
                  </div>

                  {complaint.resolution_notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Resolution Notes</h4>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-green-800 whitespace-pre-line">
                          {complaint.resolution_notes}
                        </p>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Category</h4>
                      <div className="flex items-center gap-2">
                        <span>{complaint.category?.name}</span>
                        {complaint.subcategory?.name && (
                          <>
                            <span className="text-muted-foreground">/</span>
                            <span>{complaint.subcategory?.name}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">
                        Assigned Department
                      </h4>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {complaint.department?.name || "Not assigned"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Ward</h4>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>
                          Ward {complaint.ward?.ward_number} -{" "}
                          {complaint.ward?.name}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Assigned Staff</h4>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {complaint.assigned_staff?.[0]?.user_profiles
                            ?.full_name || "Not assigned"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {complaint.address_text && (
                    <div>
                      <h4 className="font-semibold mb-2">Location</h4>
                      <p className="text-muted-foreground">
                        {complaint.address_text}
                        {complaint.landmark && (
                          <>
                            <br />
                            <span className="text-sm">
                              Landmark: {complaint.landmark}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Map */}
              {complaint.location_point && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Location Map
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 rounded-lg overflow-hidden">
                      <ComplaintMap
                        center={[
                          complaint.location_point.coordinates[1],
                          complaint.location_point.coordinates[0],
                        ]}
                        zoom={15}
                        markerPosition={[
                          complaint.location_point.coordinates[1],
                          complaint.location_point.coordinates[0],
                        ]}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Stats & Info */}
            <div className="space-y-6">
              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Status & Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {timelineEvents.map((event, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <event.icon className="w-4 h-4 text-primary" />
                          </div>
                          {index < timelineEvents.length - 1 && (
                            <div className="w-0.5 h-4 bg-border mt-1" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{event.event}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(event.date), "PPp")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* SLA Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Service Level Agreement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Submitted
                      </span>
                      <span className="font-medium">
                        {format(new Date(complaint.submitted_at), "PP")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        SLA Due
                      </span>
                      <span
                        className={`font-medium ${
                          complaint.sla_breached ? "text-red-600" : ""
                        }`}
                      >
                        {complaint.sla_due_at
                          ? format(new Date(complaint.sla_due_at), "PP")
                          : "Not set"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Time to Resolve
                      </span>
                      <span className="font-medium">
                        {complaint.time_to_resolve_hours
                          ? `${Math.round(complaint.time_to_resolve_hours)} hours`
                          : "Pending"}
                      </span>
                    </div>
                  </div>

                  {complaint.sla_breached && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">
                          SLA Breached by{" "}
                          {Math.round(complaint.sla_breach_hours)} hours
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Complaint Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Views</span>
                    <span className="font-medium">{complaint.view_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Upvotes
                    </span>
                    <span className="font-medium">
                      {complaint.upvote_count}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Attachments
                    </span>
                    <span className="font-medium">
                      {attachments?.length || 0}
                    </span>
                  </div>
                  {complaint.citizen_satisfaction_rating && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Your Rating
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">
                          {complaint.citizen_satisfaction_rating}/5
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
              <CardDescription>
                Complete timeline of status changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statusHistory && statusHistory.length > 0 ? (
                <div className="space-y-4">
                  {statusHistory.map((history: any, index: number) => (
                    <div key={history.id} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            history.new_status === "resolved" ||
                            history.new_status === "closed"
                              ? "bg-green-500"
                              : history.new_status === "rejected"
                                ? "bg-red-500"
                                : "bg-blue-500"
                          }`}
                        />
                        {index < statusHistory.length - 1 && (
                          <div className="w-0.5 h-4 bg-border mt-1" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                statusBadgeConfig[history.new_status]
                                  ?.variant as any
                              }
                            >
                              {statusBadgeConfig[history.new_status]?.label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {history.changed_by_role}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(history.changed_at), "PPp")}
                          </span>
                        </div>
                        {history.note && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {history.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No status history available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attachments Tab */}
        <TabsContent value="attachments">
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
              <CardDescription>Photos, videos, and documents</CardDescription>
            </CardHeader>
            <CardContent>
              <ComplaintAttachmentsSection
                attachments={attachments}
                canDelete={complaint.citizen_id === user.id}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Feedback
              </CardTitle>
              <CardDescription>
                Share your experience and rate the service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeedbackSection
                complaintId={id}
                existingFeedback={feedback}
                canGiveFeedback={canGiveFeedback}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
