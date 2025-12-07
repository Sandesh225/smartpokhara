// app/(protected)/staff/complaints/[id]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StaffActionPanel from "@/components/staff/StaffActionPanel";
import ComplaintMap from "@/app/(protected)/citizen/complaints/[id]/ComplaintMap";

export default async function StaffComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUserWithRoles();

  if (!user) redirect("/login");

  const supabase = await createClient();

  // Fetch complaint with all relations needed for the view
  const { data: c, error } = await supabase
    .from("complaints")
    .select(
      `
      *,
      ward:wards!fk_complaints_ward(ward_number, name),
      category:complaint_categories(name)
      `
    )
    .eq("id", id)
    .single();

  // Fetch assigned staff separately if needed
  let assignedStaffName = null;
  if (c?.assigned_staff_id) {
    const { data: staffData } = await supabase
      .from("user_profiles")
      .select("full_name")
      .eq("id", c.assigned_staff_id)
      .single();
    assignedStaffName = staffData?.full_name;
  }

  if (error || !c) {
    console.error("Error fetching complaint:", error);
    notFound();
  }

  // Security: Only allow assigned staff or admin/supervisor
  const isAssignedStaff = c.assigned_staff_id === user.id;
  const isAuthorized =
    isAssignedStaff ||
    user.roles.includes("admin") ||
    user.roles.includes("dept_head") ||
    user.roles.includes("supervisor");

  if (!isAuthorized) {
    return (
      <div className="container mx-auto p-8">
        <div className="rounded-lg bg-red-50 border border-red-200 p-6 text-center">
          <h2 className="text-lg font-semibold text-red-900 mb-2">
            Access Denied
          </h2>
          <p className="text-red-700">This complaint is not assigned to you.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Col: Details */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {c.tracking_code}
                </span>
                <CardTitle className="text-xl mt-2">{c.title}</CardTitle>
              </div>
              <div className="flex gap-2">
                <Badge
                  variant={
                    c.priority === "critical" || c.priority === "urgent"
                      ? "destructive"
                      : "outline"
                  }
                  className="capitalize"
                >
                  {c.priority}
                </Badge>
                <Badge
                  variant="outline"
                  className={`capitalize ${
                    c.status === "assigned"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : c.status === "in_progress"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : c.status === "resolved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : ""
                  }`}
                >
                  {c.status.replace("_", " ")}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-1">
                Description
              </h4>
              <p className="text-gray-800 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                {c.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block">Category</span>
                <span className="font-medium">{c.category?.name || "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Ward</span>
                <span className="font-medium">
                  Ward {c.ward?.ward_number || "N/A"}
                </span>
              </div>
            </div>

            {c.address_text && (
              <div>
                <span className="text-gray-500 block text-sm">Location</span>
                <span className="font-medium text-sm">{c.address_text}</span>
              </div>
            )}

            {/* ACTION PANEL */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-3">Actions</h4>
              <StaffActionPanel
                complaintId={c.id}
                status={c.status}
                onUpdate={async () => {
                  "use server";
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Map Visualization */}
        {c.location_point && (
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-sm">Location Map</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-64 w-full">
                <ComplaintMap
                  center={[
                    c.location_point.coordinates[1],
                    c.location_point.coordinates[0],
                  ]}
                  zoom={15}
                  markerPosition={[
                    c.location_point.coordinates[1],
                    c.location_point.coordinates[0],
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Col: Quick Info */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Complaint Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500 block">Citizen Name</span>
                <span className="font-medium">
                  {c.citizen_full_name || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Phone</span>
                <a
                  href={`tel:${c.citizen_phone}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {c.citizen_phone || "N/A"}
                </a>
              </div>
              <div>
                <span className="text-gray-500 block">Submitted</span>
                <span className="font-medium">
                  {new Date(c.submitted_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              {c.assigned_staff_id && (
                <div>
                  <span className="text-gray-500 block">Assigned To</span>
                  <span className="font-medium">
                    {assignedStaffName || "Staff Member"}
                  </span>
                </div>
              )}
              {c.sla_due_at && (
                <div>
                  <span className="text-gray-500 block">Due Date</span>
                  <span className="font-medium text-amber-600">
                    {new Date(c.sla_due_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {c.media_urls && c.media_urls.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {c.media_urls.map((url: string, idx: number) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-blue-600 hover:underline"
                  >
                    View Attachment {idx + 1}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}