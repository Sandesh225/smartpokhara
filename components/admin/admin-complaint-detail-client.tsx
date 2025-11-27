// components/admin/admin-complaint-detail-client.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Calendar, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ComplaintStatusBadge } from "@/components/complaints/complaint-status-badge";
import { ComplaintPriorityBadge } from "@/components/complaints/complaint-priority-badge";
import {
  showSuccessToast,
  showErrorToast,
} from "@/lib/shared/toast-service";
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

export function AdminComplaintDetailClient({
  complaint,
  departments,
  staffUsers,
}: AdminComplaintDetailClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(complaint.status);
  const [priority, setPriority] = useState(complaint.priority);
  const [assignedDept, setAssignedDept] = useState<string>(
    complaint.assigned_department_id || ""
  );
  const [assignedStaff, setAssignedStaff] = useState<string>(
    complaint.assigned_staff_id || ""
  );
  const [resolutionNotes, setResolutionNotes] = useState(
    complaint.resolution_notes || ""
  );

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

  const isOverdue =
    complaint.sla_due_at && new Date(complaint.sla_due_at) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/complaints"
          className="mb-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Complaints
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {complaint.title}
            </h1>
            <p className="mt-2 font-mono text-lg text-slate-600">
              {complaint.tracking_code}
            </p>
          </div>
          <div className="flex gap-2">
            <ComplaintStatusBadge status={status} size="lg" />
            <ComplaintPriorityBadge priority={priority} size="lg" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Details */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Complaint Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Category
                  </p>
                  <p className="mt-1 text-slate-900">
                    {complaint.category?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Subcategory
                  </p>
                  <p className="mt-1 text-slate-900">
                    {complaint.subcategory?.name || "N/A"}
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
                  <p className="mt-1 text-slate-900">
                    {new Date(complaint.submitted_at).toLocaleString()}
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
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-slate-600">
                  Description
                </p>
                <p className="mt-1 whitespace-pre-wrap text-slate-900">
                  {complaint.description}
                </p>
              </div>

              {complaint.sla_due_at && (
                <div
                  className={`rounded-lg border p-3 ${
                    isOverdue
                      ? "border-red-200 bg-red-50"
                      : "border-blue-200 bg-blue-50"
                  }`}
                >
                  <p className="flex items-center gap-1 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    SLA Due Date
                  </p>
                  <p className="mt-1 font-semibold">
                    {new Date(complaint.sla_due_at).toLocaleString()}
                  </p>
                  {isOverdue && (
                    <p className="mt-1 text-xs text-red-600">Overdue!</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attachments */}
          {complaint.attachments && complaint.attachments.length > 0 && (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {complaint.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50"
                    >
                      <p className="truncate text-sm font-medium text-slate-900">
                        {attachment.file_name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(
                          attachment.uploaded_at
                        ).toLocaleDateString()}
                      </p>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status history */}
          {complaint.status_history &&
            complaint.status_history.length > 0 && (
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base">Status History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {complaint.status_history.map((history) => (
                      <div
                        key={history.id}
                        className="flex gap-4 rounded-lg bg-slate-50 p-3"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <ComplaintStatusBadge
                              status={history.new_status}
                              size="sm"
                            />
                            {history.note && (
                              <span className="text-sm text-slate-600">
                                - {history.note}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {new Date(history.changed_at).toLocaleString()} by{" "}
                            {history.changed_by?.user_profiles?.full_name ||
                              history.changed_by?.email ||
                              "System"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Escalations */}
          {complaint.escalations && complaint.escalations.length > 0 && (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">
                  Escalation History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complaint.escalations.map((escalation) => (
                    <div
                      key={escalation.id}
                      className="rounded-lg border border-slate-200 p-4"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-slate-900">
                            Escalated{" "}
                            {new Date(
                              escalation.escalated_at
                            ).toLocaleDateString()}
                          </h3>
                          <p className="text-sm text-slate-600">
                            By:{" "}
                            {escalation.escalated_by_user?.user_profiles
                              ?.full_name ||
                              escalation.escalated_by_user?.email ||
                              "System"}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {escalation.sla_breached && (
                            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                              SLA Breached
                            </span>
                          )}
                          {escalation.resolved_at ? (
                            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                              Resolved
                            </span>
                          ) : (
                            <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                              Active
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="mb-2 text-sm text-slate-700">
                        <strong>Reason:</strong> {escalation.reason}
                      </p>

                      {escalation.escalated_to_user && (
                        <p className="text-sm text-slate-600">
                          <strong>Escalated To:</strong>{" "}
                          {escalation.escalated_to_user.user_profiles
                            ?.full_name ||
                            escalation.escalated_to_user.email}
                        </p>
                      )}

                      {escalation.escalated_to_department && (
                        <p className="text-sm text-slate-600">
                          <strong>Escalated To Department:</strong>{" "}
                          {escalation.escalated_to_department.name}
                        </p>
                      )}

                      {escalation.resolved_at && (
                        <div className="mt-2 border-t border-slate-200 pt-2">
                          <p className="text-sm text-slate-600">
                            <strong>Resolved:</strong>{" "}
                            {new Date(
                              escalation.resolved_at
                            ).toLocaleDateString()}
                          </p>
                          {escalation.resolution_note && (
                            <p className="mt-1 text-sm text-slate-700">
                              <strong>Resolution Note:</strong>{" "}
                              {escalation.resolution_note}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Update form */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Update Complaint</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-900">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
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

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-900">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
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
                  Resolution Notes
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={4}
                  placeholder="Add resolution notes..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <Button
                onClick={handleUpdate}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Updating..." : "Update Complaint"}
              </Button>
            </CardContent>
          </Card>

          {/* Citizen info */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Citizen Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-600">Name</p>
                  <p className="font-medium text-slate-900">
                    {complaint.citizen?.user_profiles?.full_name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">Email</p>
                  <p className="font-medium text-slate-900">
                    {complaint.citizen?.email || "N/A"}
                  </p>
                </div>
                {complaint.citizen?.user_profiles?.phone_number && (
                  <div>
                    <p className="text-slate-600">Phone</p>
                    <p className="font-medium text-slate-900">
                      {complaint.citizen.user_profiles.phone_number}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
