import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { getUserDisplayName } from "@/lib/auth/role-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, TrendingUp, AlertTriangle, Award } from "lucide-react";

export default async function SupervisorDashboard() {
  const user = await getCurrentUserWithRoles();

  if (!user) {
    return null;
  }

  const displayName = getUserDisplayName(user);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Supervisor Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Department Overview & Performance
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl shadow-lg p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome, {displayName}!</h2>
          <p className="text-purple-100">
            Managing Roads & Infrastructure Department
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Team Members
              </CardTitle>
              <Users className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">24</div>
              <p className="text-xs text-gray-500 mt-1">Active staff</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Dept. Complaints
              </CardTitle>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">156</div>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Escalations
              </CardTitle>
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">8</div>
              <p className="text-xs text-gray-500 mt-1">Needs attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Performance
              </CardTitle>
              <Award className="w-5 h-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">92%</div>
              <p className="text-xs text-gray-500 mt-1">SLA compliance</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Detailed performance metrics and team analytics will be displayed
              here.
            </p>
            <div className="mt-4">
              <Link href="/supervisor-app/analytics">
                <Button>View Full Analytics</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
