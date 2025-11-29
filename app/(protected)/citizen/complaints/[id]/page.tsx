/**
 * Complaint detail page
 * Shows complaint details, timeline, attachments, and feedback
 */

import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ComplaintDetailsHeader } from "@/components/citizen/complaints/ComplaintDetailsHeader";
import { ComplaintTimeline } from "@/components/citizen/complaints/ComplaintTimeline";
import { ComplaintAttachments } from "@/components/citizen/complaints/ComplaintAttachments";
import { FeedbackSection } from "@/components/complaints/FeedbackSection";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CitizenComplaintDetailPage({
  params,
}: PageProps) {
  const { id } = await params;
  const user = await getCurrentUserWithRoles();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  try {
    // Fetch complaint with all relations
    const { data: complaint, error: complaintError } = await supabase
      .from("complaints")
      .select(
        `
        *,
        category:complaint_categories(*),
        subcategory:complaint_subcategories(*),
        ward:wards(*),
        department:departments(*),
        assigned_staff:users!complaints_assigned_staff_id_fkey(
          id,
          email,
          user_profiles(full_name)
        )
      `
      )
      .eq("id", id)
      .maybeSingle();

    if (complaintError || !complaint) {
      console.error("Complaint not found:", complaintError);

      return (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Complaint Not Found
            </h1>
            <p className="mt-2 text-gray-600">
              The complaint you are looking for does not exist or you don't have
              permission to view it.
            </p>
            <div className="mt-4">
              <Link
                href="/citizen/complaints"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                ← Back to My Complaints
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // Verify ownership
    if (complaint.citizen_id !== user.id) {
      console.warn(
        `User ${user.id} attempted to access complaint ${id} belonging to ${complaint.citizen_id}`
      );
      redirect("/citizen/complaints");
    }

    // Fetch status history and attachments in parallel
    const [statusHistoryResult, attachmentsResult] = await Promise.all([
      supabase
        .from("complaint_status_history")
        .select(
          `
          *,
          changed_by_user:users(id, email, user_profiles(full_name))
        `
        )
        .eq("complaint_id", id)
        .order("changed_at", { ascending: true }),
      supabase
        .from("complaint_attachments")
        .select("*")
        .eq("complaint_id", id)
        .order("uploaded_at", { ascending: false }),
    ]);

    const statusHistory = statusHistoryResult.data || [];
    const attachments = attachmentsResult.data || [];

    return (
      <div className="space-y-6">
        <ComplaintDetailsHeader complaint={complaint} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Complaint Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Complaint Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Description
                  </label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                    {complaint.description}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Address
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {complaint.address_text}
                  </p>
                  {complaint.landmark && (
                    <p className="mt-1 text-sm text-gray-900">
                      Landmark: {complaint.landmark}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Status Timeline</h2>
              {statusHistory.length > 0 ? (
                <ComplaintTimeline timeline={statusHistory} />
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No status history available.
                </p>
              )}
            </div>

            {/* Attachments */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Attachments</h2>
              <ComplaintAttachments
                complaintId={id}
                attachments={attachments}
                canUpload={false}
              />
            </div>
          </div>

          <div className="space-y-6">
            {/* Feedback Section */}
            {(complaint.status === "resolved" ||
              complaint.status === "closed") && (
              <FeedbackSection complaint={complaint} />
            )}

            {/* Complaint Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                Complaint Information
              </h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Tracking Code
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {complaint.tracking_code}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Submitted
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(complaint.submitted_at).toLocaleDateString()} at{" "}
                    {new Date(complaint.submitted_at).toLocaleTimeString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    SLA Due Date
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(complaint.sla_due_at).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Source</dt>
                  <dd className="text-sm text-gray-900 capitalize">
                    {complaint.source.replace("_", " ")}
                  </dd>
                </div>
                {complaint.department && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Assigned Department
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {complaint.department.name}
                    </dd>
                  </div>
                )}
                {complaint.assigned_staff && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Assigned Staff
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {complaint.assigned_staff.user_profiles?.full_name ||
                        complaint.assigned_staff.email}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading complaint:", error);

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Error Loading Complaint
          </h1>
          <p className="mt-2 text-gray-600">
            There was an error loading the complaint. Please try again.
          </p>
          <div className="mt-4">
            <Link
              href="/citizen/complaints"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              ← Back to My Complaints
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
