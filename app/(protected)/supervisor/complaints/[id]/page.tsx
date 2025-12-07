import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SupervisorResolutionReview from "@/components/supervisor/SupervisorResolutionReview"; // Import component
import TimelineView from "@/components/citizen/TimelineView"; // Reuse timeline

export default async function SupervisorComplaintDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const { data: c, error } = await supabase
    .from("complaints")
    .select(
      `
      *, 
      ward:wards(ward_number), 
      category:complaint_categories(name),
      assigned_staff:users!assigned_staff_id(user_profiles(full_name))
    `
    )
    .eq("id", id)
    .single();

  if (error || !c) notFound();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Complaint Management</h1>
        <Badge variant="outline" className="text-base px-3 py-1 uppercase">
          {c.status.replace("_", " ")}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Issue Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md border">
                <h3 className="font-semibold text-lg">{c.title}</h3>
                <p className="text-gray-700 mt-2">{c.description}</p>
              </div>

              {/* Resolution Notes (if available) */}
              {c.resolution_notes && (
                <div className="bg-green-50 p-4 rounded-md border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-1">
                    Staff Resolution Notes:
                  </h4>
                  <p className="text-green-700">{c.resolution_notes}</p>
                </div>
              )}

              {/* SUPERVISOR REVIEW ACTION */}
              {c.status === "resolved" && (
                <div className="mt-6 pt-6 border-t">
                  <SupervisorResolutionReview
                    complaintId={c.id}
                    status={c.status}
                    // onUpdate handled by client component router.refresh()
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <TimelineView complaintId={c.id} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Assignment Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="block text-gray-500">Assigned Staff</span>
                <span className="font-medium">
                  {c.assigned_staff?.user_profiles?.full_name || "Unassigned"}
                </span>
              </div>
              <div>
                <span className="block text-gray-500">Priority</span>
                <span className="font-medium capitalize">{c.priority}</span>
              </div>
              <div>
                <span className="block text-gray-500">Department</span>
                {/* We assume supervisor knows their own dept, but could fetch dept name */}
                <span className="font-medium">Your Department</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
