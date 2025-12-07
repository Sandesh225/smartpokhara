import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ComplaintActions from "@/components/supervisor/ComplaintActions";
import { formatDistanceToNow } from "date-fns";

export default async function SupervisorComplaintsPage() {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();

  // 1. Get Supervisor's Department
  const { data: staffProfile } = await supabase
    .from("staff_profiles")
    .select("department_id")
    .eq("user_id", user.id)
    .single();

  if (!staffProfile?.department_id) {
    return (
      <div className="p-8 text-center text-red-600">
        Error: You are not assigned to a department. Please contact an administrator.
      </div>
    );
  }

  // 2. Fetch Complaints for that Department
  // FIX: Added "!fk_complaints_ward" to resolve the ambiguous relationship error
  const { data: complaints, error } = await supabase
    .from("complaints")
    .select(`
      id,
      tracking_code,
      title,
      status,
      priority,
      submitted_at,
      ward:wards!fk_complaints_ward(ward_number),
      category:complaint_categories(name),
      assigned_staff:users!fk_complaints_staff(
        user_profiles(full_name)
      )
    `)
    .eq("assigned_department_id", staffProfile.department_id)
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("Supabase Error:", error);
    return <div className="p-8 text-center text-red-500">Error loading complaints: {error.message}</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Department Complaints Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Ward</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-gray-500">
                    No complaints found for your department.
                  </TableCell>
                </TableRow>
              ) : (
                complaints?.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.tracking_code}</TableCell>
                    <TableCell>
                      <div className="font-medium">{c.title}</div>
                      <div className="text-xs text-gray-500">{c.category?.name}</div>
                    </TableCell>
                    <TableCell>{c.ward?.ward_number || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={c.priority === 'high' || c.priority === 'critical' ? 'destructive' : 'default'} className="capitalize">
                        {c.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline" className="capitalize">{c.status.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      {c.assigned_staff ? (
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-green-500" />
                           <span className="text-sm">{c.assigned_staff.user_profiles?.full_name || "Staff"}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-sm">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <ComplaintActions 
                        complaintId={c.id} 
                        currentDeptId={staffProfile.department_id}
                        trackingCode={c.tracking_code}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}