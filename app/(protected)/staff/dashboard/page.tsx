import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isStaff, isAdmin } from "@/lib/auth/role-helpers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  ArrowRight,
  MapPin,
  Calendar,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function StaffDashboardPage() {
  const user = await getCurrentUserWithRoles();

  if (!user) redirect("/login");
  if (!isStaff(user) && !isAdmin(user)) redirect("/citizen/dashboard");

  const supabase = await createClient();

  // 1. Fetch Assigned Complaints for the current user
  // FIX: Added "!fk_complaints_ward" to resolve ambiguous relationship error
  const { data: assignments, error } = await supabase
    .from("complaints")
    .select(
      `
      id, 
      tracking_code, 
      title, 
      status, 
      priority, 
      sla_due_at, 
      submitted_at,
      ward:wards!fk_complaints_ward(ward_number),
      category:complaint_categories(name)
    `
    )
    .eq("assigned_staff_id", user.id)
    .neq("status", "closed") // Filter out closed
    .order("priority", { ascending: false }) // Critical/Urgent first
    .order("submitted_at", { ascending: true }); // Oldest first

  if (error) {
    console.error("Error fetching assignments:", error);
  }

  const pendingCount =
    assignments?.filter((c) => ["assigned", "received"].includes(c.status))
      .length || 0;
  const activeCount =
    assignments?.filter((c) => ["accepted", "in_progress"].includes(c.status))
      .length || 0;
  const resolvedCount =
    assignments?.filter((c) => c.status === "resolved").length || 0;

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Workspace</h1>
          <p className="text-gray-500">
            Manage your assigned tasks and updates.
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-900">
            {new Date().toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500">Today</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                New Assignments
              </p>
              <p className="text-3xl font-bold text-blue-900">{pendingCount}</p>
            </div>
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">In Progress</p>
              <p className="text-3xl font-bold text-amber-900">{activeCount}</p>
            </div>
            <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600">
                Resolved Pending
              </p>
              <p className="text-3xl font-bold text-emerald-900">
                {resolvedCount}
              </p>
            </div>
            <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Queue */}
      <Card>
        <CardHeader>
          <CardTitle>My Task Queue</CardTitle>
        </CardHeader>
        <CardContent>
          {!assignments?.length ? (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="font-medium">All caught up!</p>
              <p className="text-sm">You have no pending assignments.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((task: any) => (
                <div
                  key={task.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors gap-4"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        {task.tracking_code}
                      </span>
                      <Badge
                        variant={
                          task.priority === "critical" ||
                          task.priority === "urgent"
                            ? "destructive"
                            : "secondary"
                        }
                        className="capitalize"
                      >
                        {task.priority}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`capitalize ${
                          task.status === "assigned"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : task.status === "in_progress"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : ""
                        }`}
                      >
                        {task.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-gray-900">
                      {task.title}
                    </h3>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        Ward {task.ward?.ward_number}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Due{" "}
                        {formatDistanceToNow(new Date(task.sla_due_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>

                  <Link href={`/staff/complaints/${task.id}`}>
                    <Button size="sm" className="w-full sm:w-auto">
                      View Details <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
