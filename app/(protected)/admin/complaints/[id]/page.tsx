// app/(protected)/admin/complaints/[id]/page.tsx
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Separator } from "@/ui/separator";
import {
  ArrowLeft,
  Edit,
  Clock,
  MapPin,
  User,
  Building,
  AlertCircle,
  MessageSquare,
  Paperclip,
  History,
} from "lucide-react";
import Link from "next/link";

import ComplaintTimeline from "@/components/admin/complaints/ComplaintTimeline";
import AdminActionsPanel from "@/components/admin/complaints/AdminActionsPanel";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";

interface ComplaintDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ComplaintDetailPage({
  params,
}: ComplaintDetailPageProps) {
  const supabase = await createClient();

  // Get complaint details using RPC
  const { data: complaintData, error } = await supabase.rpc(
    "rpc_admin_get_complaint_detail",
    {
      p_complaint_id: params.id,
    }
  );

  if (error || !complaintData?.data) {
    notFound();
  }

  const complaint = complaintData.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/complaints">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Complaints
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{complaint.complaint.title}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline">
                {complaint.complaint.tracking_code}
              </Badge>
              <Badge
                variant={
                  complaint.complaint.priority === "critical"
                    ? "destructive"
                    : complaint.complaint.priority === "urgent"
                      ? "default"
                      : complaint.complaint.priority === "high"
                        ? "default"
                        : "secondary"
                }
              >
                {complaint.complaint.priority}
              </Badge>
              <Badge
                variant={
                  complaint.complaint.status === "resolved"
                    ? "success"
                    : complaint.complaint.status === "in_progress"
                      ? "default"
                      : complaint.complaint.status === "closed"
                        ? "secondary"
                        : "outline"
                }
              >
                {complaint.complaint.status}
              </Badge>
              {complaint.complaint.is_overdue && (
                <Badge variant="destructive">SLA Breached</Badge>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Complaint Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Complaint Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Description
                  </p>
                  <p className="mt-1">{complaint.complaint.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Submitted</p>
                  <p className="mt-1">
                    {format(
                      new Date(complaint.complaint.submitted_at),
                      "MMM d, yyyy h:mm a"
                    )}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Citizen</p>
                    <p className="text-sm">{complaint.citizen.name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ward</p>
                    <p className="text-sm">
                      Ward {complaint.location.ward_number}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Department
                    </p>
                    <p className="text-sm">
                      {complaint.assignment.department_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">SLA Due</p>
                    <p className="text-sm">
                      {format(
                        new Date(complaint.complaint.sla_due_at),
                        "MMM d, yyyy"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          {complaint.attachments && complaint.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paperclip className="h-5 w-5" />
                  Attachments ({complaint.attachments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {complaint.attachments.map((attachment: any) => (
                    <div key={attachment.id} className="border rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                          <Paperclip className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium truncate">
                            {attachment.file_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(
                              new Date(attachment.uploaded_at),
                              "MMM d, yyyy"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Internal Comments */}
          {complaint.internal_comments &&
            complaint.internal_comments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Internal Discussion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {complaint.internal_comments.map((comment: any) => (
                      <div
                        key={comment.id}
                        className="border-l-4 border-blue-500 pl-4 py-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">
                            {comment.user_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(
                              new Date(comment.created_at),
                              "MMM d, h:mm a"
                            )}
                          </p>
                        </div>
                        <p className="text-sm mt-1">{comment.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Status Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ComplaintTimeline timeline={complaint.timeline} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Admin Actions */}
        <div className="space-y-6">
          <AdminActionsPanel
            complaint={complaint.complaint}
            assignment={complaint.assignment}
            citizen={complaint.citizen}
          />

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Time to Assign</span>
                <span className="text-sm font-medium">
                  {complaint.assignment.assigned_at
                    ? `${Math.round(
                        (new Date(complaint.assignment.assigned_at).getTime() -
                          new Date(
                            complaint.complaint.submitted_at
                          ).getTime()) /
                          (1000 * 60 * 60)
                      )}h`
                    : "Not assigned"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Citizen Rating</span>
                <span className="text-sm font-medium">
                  {complaint.complaint.citizen_rating || "Not rated"} / 5
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Internal Notes</span>
                <span className="text-sm font-medium">
                  {complaint.internal_comments?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Attachments</span>
                <span className="text-sm font-medium">
                  {complaint.attachments?.length || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Related Complaints */}
          <Card>
            <CardHeader>
              <CardTitle>Related Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* This would be populated from a separate query */}
                <p className="text-sm text-gray-500">
                  No related complaints found
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
