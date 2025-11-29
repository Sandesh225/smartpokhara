// components/admin/admin-complaint-detail-client.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  Clock,
  AlertTriangle,
  CheckCircle,
  Edit,
  Download,
  Share2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ComplaintStatusBadge } from "@/components/admin/complaint-status-badge";
import { ComplaintPriorityBadge } from "@/components/admin/complaint-priority-badge";
import { showSuccessToast, showErrorToast } from "@/lib/shared/toast-service";
import type {
  ComplaintFull,
  Department,
  UserSummary,
} from "@/lib/types/complaints";

interface AdminComplaintDetailClientProps {
  complaint: ComplaintFull;
  departments: Department[];
  staffUsers: UserSummary[];
}

type ComplaintStatus = ComplaintFull["status"];
type ComplaintPriority = ComplaintFull["priority"];

export function AdminComplaintDetailClient({
  complaint,
  departments,
  staffUsers,
}: AdminComplaintDetailClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<ComplaintStatus>(complaint.status);
  const [priority, setPriority] = useState<ComplaintPriority>(
    complaint.priority
  );
  const [assignedDept, setAssignedDept] = useState<string>(
    complaint.assigned_department_id || ""
  );
  const [assignedStaff, setAssignedStaff] = useState<string>(
    complaint.assigned_staff_id || ""
  );
  const [resolutionNotes, setResolutionNotes] = useState(
    complaint.resolution_notes || ""
  );
  const [internalNotes, setInternalNotes] = useState("");

  const isOverdue =
    complaint.sla_due_at && new Date(complaint.sla_due_at) < new Date();

  const handleUpdate = async () => {
    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from("complaints")
        .update({
          status,
          priority,
          assigned_department_id: assignedDept || null,
          assigned_staff_id: assignedStaff || null,
          resolution_notes: resolutionNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", complaint.id);

      if (error) throw error;

      showSuccessToast("Complaint updated successfully");
      router.refresh();
    } catch (error) {
      console.error("Error updating complaint:", error);
      showErrorToast("Failed to update complaint");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddInternalNote = async () => {
    if (!internalNotes.trim()) return;

    try {
      const { error } = await supabase
        .from("complaint_internal_comments")
        .insert({
          complaint_id: complaint.id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          comment: internalNotes,
          is_work_log: false,
        });

      if (error) throw error;

      showSuccessToast("Internal note added");
      setInternalNotes("");
      router.refresh();
    } catch (error) {
      console.error("Error adding internal note:", error);
      showErrorToast("Failed to add internal note");
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/admin/complaints"
            className="mt-1 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Complaints
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <ComplaintPriorityBadge priority={priority} size="lg" />
              <h1 className="text-3xl font-bold text-slate-900">
                {complaint.title}
              </h1>
            </div>
            <p className="mt-2 font-mono text-lg text-slate-600">
              {complaint.tracking_code}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <ComplaintStatusBadge status={status} size="lg" />
          {isOverdue && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Overdue
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content - Left panel */}
        <div className="space-y-6 lg:col-span-2">
          {/* Complaint details */}
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Complaint Details</CardTitle>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">Category</p>
                  <p className="mt-1 text-slate-900">
                    {complaint.category?.name || "N/A"}
                    {complaint.subcategory && (
                      <span className="text-slate-500">
                        {" "}→ {complaint.subcategory.name}
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Ward</p>
                  <p className="mt-1 text-slate-900">
                    Ward {complaint.ward?.ward_number || "N/A"}{" "}
                    {complaint.ward?.name ? `- ${complaint.ward.name}` : ""}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Submitted Date
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-slate-900">
                    <Calendar className="h-4 w-4" />
                    {new Date(complaint.submitted_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    SLA Due Date
                  </p>
                  <p className={`mt-1 flex items-center gap-1 ${
                    isOverdue ? "text-red-600 font-semibold" : "text-slate-900"
                  }`}>
                    <Clock className="h-4 w-4" />
                    {complaint.sla_due_at 
                      ? new Date(complaint.sla_due_at).toLocaleString()
                      : "Not set"
                    }
                  </p>
                </div>
              </div>

              {complaint.address_text && (
                <div>
                  <p className="flex items-center gap-1 text-sm font-medium text-slate-600">
                    <MapPin className="h-4 w-4" />
                    Location
                  </p>
                  <p className="mt-1 text-slate-900">
                    {complaint.address_text}
                    {complaint.landmark && (
                      <span className="text-slate-500"> ({complaint.landmark})</span>
                    )}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-slate-600">
                  Description
                </p>
                <p className="mt-1 whitespace-pre-wrap text-slate-900 rounded-lg bg-slate-50 p-3">
                  {complaint.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          {complaint.attachments && complaint.attachments.length > 0 && (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">
                  Attachments ({complaint.attachments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {complaint.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50"
                    >
                      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-200">
                        <Download className="h-6 w-6 text-blue-600" />
                      </div>
                      <p className="text-center text-xs font-medium text-slate-900 line-clamp-2">
                        {attachment.file_name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(attachment.uploaded_at).toLocaleDateString()}
                      </p>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status history */}
          {complaint.status_history && complaint.status_history.length > 0 && (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">Status Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complaint.status_history
                    .sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime())
                    .map((history, index) => (
                      <div key={history.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
                            index === 0 ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-600"
                          }`}>
                            {index === 0 ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-current" />
                            )}
                          </div>
                          {index < complaint.status_history!.length - 1 && (
                            <div className="mt-1 h-full w-0.5 bg-slate-200" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2">
                            <ComplaintStatusBadge
                              status={history.new_status}
                              size="sm"
                            />
                            <span className="text-xs text-slate-500">
                              {formatTimeAgo(history.changed_at)}
                            </span>
                          </div>
                          {history.note && (
                            <p className="mt-1 text-sm text-slate-700">
                              {history.note}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-slate-500">
                            By {history.changed_by?.user_profiles?.full_name ||
                              history.changed_by?.email ||
                              "System"} • {new Date(history.changed_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Internal notes */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Internal Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Add internal note or work log..."
                  rows={3}
                  className="flex-1"
                />
                <Button onClick={handleAddInternalNote} disabled={!internalNotes.trim()}>
                  Add Note
                </Button>
              </div>
              <div className="rounded-lg border border-slate-200 p-4 text-center text-slate-500">
                <p className="text-sm">No internal notes yet.</p>
                <p className="text-xs">Add the first note to start the discussion.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right panel */}
        <div className="space-y-6">
          {/* Citizen information */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Citizen Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-600">Name</p>
                <p className="font-medium text-slate-900">
                  {complaint.citizen?.user_profiles?.full_name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Email</p>
                <div className="flex items-center gap-1 font-medium text-slate-900">
                  <Mail className="h-4 w-4" />
                  {complaint.citizen?.email || "N/A"}
                </div>
              </div>
              {complaint.citizen?.user_profiles?.phone_number && (
                <div>
                  <p className="text-sm font-medium text-slate-600">Phone</p>
                  <div className="flex items-center gap-1 font-medium text-slate-900">
                    <Phone className="h-4 w-4" />
                    {complaint.citizen.user_profiles.phone_number}
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Phone className="mr-2 h-4 w-4" />
                  Call
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Assignment panel */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-900">
                  Department
                </label>
                <select
                  value={assignedDept}
                  onChange={(e) => setAssignedDept(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">Unassigned</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-900">
                  Assign Staff
                </label>
                <select
                  value={assignedStaff}
                  onChange={(e) => setAssignedStaff(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">Unassigned</option>
                  {staffUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.user_profiles?.full_name || user.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-900">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as ComplaintPriority)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-900">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="submitted">Submitted</option>
                  <option value="received">Received</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Resolution notes */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Resolution Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Add resolution notes..."
                rows={4}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={handleUpdate} disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Updating..." : "Update Complaint"}
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Escalate
                </Button>
                <Button variant="outline" size="sm">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Mark Urgent
                </Button>
              </div>
              <Button variant="outline" className="w-full" size="sm">
                Create Follow-up Task
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                Send Update to Citizen
              </Button>
            </CardContent>
          </Card>

          {/* Escalation history */}
          {complaint.escalations && complaint.escalations.length > 0 && (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">Escalation History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complaint.escalations.map((escalation) => (
                    <div
                      key={escalation.id}
                      className="rounded-lg border border-slate-200 p-3"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {new Date(escalation.escalated_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-slate-600">
                            By: {escalation.escalated_by_user?.user_profiles?.full_name ||
                              escalation.escalated_by_user?.email ||
                              "System"}
                          </p>
                        </div>
                        {escalation.sla_breached && (
                          <Badge variant="destructive" className="text-xs">
                            SLA Breached
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-700">
                        {escalation.reason}
                      </p>
                      {escalation.resolved_at && (
                        <p className="mt-2 text-xs text-green-600">
                          Resolved on {new Date(escalation.resolved_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}