import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ComplaintDetailsHeader } from "@/components/citizen/complaints/ComplaintDetailsHeader";
import { ComplaintTimeline } from "@/components/citizen/complaints/ComplaintTimeline";
import { ComplaintAttachments } from "@/components/citizen/complaints/ComplaintAttachments";
import { FeedbackSection } from "@/components/complaints/FeedbackSection";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  User,
  Building2,
  FileText,
  Image as ImageIcon,
  Download,
} from "lucide-react";

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
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-slide-up">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complaint Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The complaint you are looking for does not exist or you don't have
              permission to view it.
            </p>
            <Link
              href="/citizen/complaints"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to My Complaints
            </Link>
          </div>
        </div>
      );
    }

    if (complaint.citizen_id !== user.id) {
      redirect("/citizen/complaints");
    }

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Back Button */}
          <Link
            href="/citizen/complaints"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors group animate-slide-down"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to My Complaints</span>
          </Link>

          {/* Header */}
          <div className="animate-slide-down">
            <ComplaintDetailsHeader complaint={complaint} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Details Card */}
              <div className="glass rounded-2xl shadow-xl p-6 border border-white/30 animate-slide-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Complaint Details
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Description
                    </label>
                    <p className="text-sm text-slate-900 whitespace-pre-wrap leading-relaxed">
                      {complaint.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <label className="text-sm font-semibold text-slate-700">
                          Address
                        </label>
                      </div>
                      <p className="text-sm text-slate-900">
                        {complaint.address_text || "Not specified"}
                      </p>
                      {complaint.landmark && (
                        <p className="text-sm text-slate-600 mt-1">
                          📍 {complaint.landmark}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="glass rounded-2xl shadow-xl p-6 border border-white/30 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Status Timeline
                  </h2>
                </div>
                {statusHistory.length > 0 ? (
                  <ComplaintTimeline timeline={statusHistory} />
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500">
                      No status history available yet.
                    </p>
                  </div>
                )}
              </div>

              {/* Attachments */}
              <div className="glass rounded-2xl shadow-xl p-6 border border-white/30 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Attachments
                  </h2>
                </div>
                <ComplaintAttachments
                  complaintId={id}
                  attachments={attachments}
                  canUpload={false}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Feedback Section */}
              {(complaint.status === "resolved" ||
                complaint.status === "closed") && (
                <div className="animate-slide-up">
                  <FeedbackSection complaint={complaint} />
                </div>
              )}

              {/* Info Card */}
              <div className="glass rounded-2xl shadow-xl p-6 border border-white/30 animate-slide-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Information
                  </h2>
                </div>

                <dl className="space-y-4">
                  <InfoItem
                    icon={<FileText className="w-4 h-4" />}
                    label="Tracking Code"
                    value={complaint.tracking_code}
                    highlight
                  />
                  <InfoItem
                    icon={<Calendar className="w-4 h-4" />}
                    label="Submitted"
                    value={`${new Date(complaint.submitted_at).toLocaleDateString()} at ${new Date(complaint.submitted_at).toLocaleTimeString()}`}
                  />
                  <InfoItem
                    icon={<Clock className="w-4 h-4" />}
                    label="SLA Due Date"
                    value={new Date(complaint.sla_due_at).toLocaleDateString()}
                  />
                  <InfoItem
                    icon={<MapPin className="w-4 h-4" />}
                    label="Source"
                    value={complaint.source.replace("_", " ")}
                    capitalize
                  />
                  {complaint.department && (
                    <InfoItem
                      icon={<Building2 className="w-4 h-4" />}
                      label="Department"
                      value={complaint.department.name}
                    />
                  )}
                  {complaint.assigned_staff && (
                    <InfoItem
                      icon={<User className="w-4 h-4" />}
                      label="Assigned Staff"
                      value={
                        complaint.assigned_staff.user_profiles?.full_name ||
                        complaint.assigned_staff.email
                      }
                    />
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading complaint:", error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="glass rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Error Loading Complaint
          </h1>
          <p className="text-gray-600 mb-6">
            There was an error loading the complaint. Please try again.
          </p>
          <Link
            href="/citizen/complaints"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Complaints
          </Link>
        </div>
      </div>
    );
  }
}

function InfoItem({
  icon,
  label,
  value,
  highlight = false,
  capitalize = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className="group">
      <dt className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-1">
        <span className="text-slate-400 group-hover:text-blue-600 transition-colors">
          {icon}
        </span>
        {label}
      </dt>
      <dd
        className={`text-sm font-medium ${
          highlight
            ? "font-mono text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg inline-block"
            : "text-slate-900"
        } ${capitalize ? "capitalize" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
