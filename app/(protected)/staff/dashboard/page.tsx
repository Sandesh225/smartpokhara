import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { getUserDisplayName, getPrimaryRole } from "@/lib/auth/role-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default async function StaffDashboard() {
  const user = await getCurrentUserWithRoles();

  if (!user) {
    return null;
  }

  const displayName = getUserDisplayName(user);
  const primaryRole = getPrimaryRole(user);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-black mb-2">Staff Dashboard</h1>
        <p className="text-blue-100 text-lg">Welcome, {displayName}</p>
        <div className="mt-4">
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
            {primaryRole?.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Pending Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-gray-600 mt-2">Assigned to you</p>
            <Link href="/staff/tasks">
              <Button className="w-full mt-4">View Tasks</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5</div>
            <p className="text-gray-600 mt-2">Currently working</p>
            <Link href="/staff/complaints">
              <Button className="w-full mt-4">View Complaints</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
            <p className="text-gray-600 mt-2">This month</p>
            <Link href="/staff/completed">
              <Button variant="outline" className="w-full mt-4">
                View Completed
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
