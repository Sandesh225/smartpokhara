// app/(protected)/citizen/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import {
  getUserDisplayName,
  getPrimaryRole,
  getRoleDisplayName,
} from "@/lib/auth/role-helpers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  TrendingUp,
  Bell,
  MapPin,
  Users,
  BarChart3,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RpcMyComplaint = {
  id: string;
  tracking_code: string;
  title: string;
  category_name: string | null;
  subcategory_name: string | null;
  status:
    | "draft"
    | "submitted"
    | "received"
    | "assigned"
    | "accepted"
    | "in_progress"
    | "resolved"
    | "closed"
    | "rejected"
    | "reopened";
  priority: "low" | "medium" | "high" | "urgent" | "critical";
  ward_number: number | null;
  submitted_at: string;
  last_updated_at: string;
  sla_due_at: string | null;
  is_overdue: boolean;
  assigned_department_name: string | null;
  thumbnail_url: string | null;
  upvote_count: number;
};

export default async function CitizenDashboard() {
  const user = await getCurrentUserWithRoles();
  if (!user) {
    return null;
  }

  const supabase = await createClient();

  // Get user's complaints
  const { data: complaints = [] } = await supabase.rpc(
    "rpc_get_my_complaints",
    {
      p_status: null,
      p_limit: 50,
      p_offset: 0,
    }
  );

  const typedComplaints = complaints as RpcMyComplaint[];

  // Get dashboard stats
  const { data: statsData } = await supabase.rpc("rpc_get_admin_dashboard");

  // Get notifications count
  const { count: unreadNotifications } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  const stats = {
    totalComplaints: typedComplaints.length,
    pending: typedComplaints.filter((c) =>
      ["submitted", "received", "assigned"].includes(c.status)
    ).length,
    inProgress: typedComplaints.filter((c) =>
      ["accepted", "in_progress"].includes(c.status)
    ).length,
    resolved: typedComplaints.filter((c) =>
      ["resolved", "closed"].includes(c.status)
    ).length,
    overdue: typedComplaints.filter((c) => c.is_overdue).length,
    unreadNotifications: unreadNotifications || 0,
  };

  const recentComplaints = typedComplaints
    .slice()
    .sort(
      (a, b) =>
        new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    )
    .slice(0, 5);

  const displayName = getUserDisplayName(user);
  const primaryRole = getPrimaryRole(user);
  const roleName = primaryRole ? getRoleDisplayName(primaryRole) : "Citizen";

  // Get user profile for ward info
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*, ward:wards(ward_number, name)")
    .eq("user_id", user.id)
    .single();

  const statusColor = (status: RpcMyComplaint["status"]) => {
    if (["resolved", "closed"].includes(status)) {
      return {
        dot: "bg-green-500",
        pill: "bg-green-100 text-green-700",
      };
    }
    if (["in_progress", "accepted"].includes(status)) {
      return {
        dot: "bg-orange-500",
        pill: "bg-orange-100 text-orange-700",
      };
    }
    if (["submitted", "received", "assigned"].includes(status)) {
      return {
        dot: "bg-yellow-500",
        pill: "bg-yellow-100 text-yellow-700",
      };
    }
    if (status === "rejected") {
      return {
        dot: "bg-red-500",
        pill: "bg-red-100 text-red-700",
      };
    }
    return {
      dot: "bg-gray-400",
      pill: "bg-gray-100 text-gray-700",
    };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black mb-2">
              Welcome back, {displayName}!
            </h1>
            <p className="text-blue-100 text-lg mb-4">
              You're logged in as{" "}
              <span className="font-semibold">{roleName}</span>
              {profile?.ward && (
                <span className="ml-4">
                  • Ward {profile.ward.ward_number} - {profile.ward.name}
                </span>
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/citizen/complaints/new">
                <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg px-6 py-3">
                  <Plus className="w-4 h-4 mr-2" />
                  Submit New Complaint
                </Button>
              </Link>
              <Link href="/citizen/complaints">
                <Button
                  variant="outline"
                  className="bg-transparent border-white/70 text-white hover:bg-white/10 px-6 py-3"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View My Complaints
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold">{stats.totalComplaints}</div>
              <div className="text-sm text-blue-200">Total Complaints</div>
            </div>
            <div className="h-12 w-px bg-white/30 hidden md:block" />
            <div className="text-center">
              <div className="text-4xl font-bold text-green-300">
                {stats.resolved}
              </div>
              <div className="text-sm text-blue-200">Resolved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Complaints
            </CardTitle>
            <FileText className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalComplaints}
            </div>
            <p className="text-xs text-gray-500 mt-1">All time submissions</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending
            </CardTitle>
            <Clock className="w-5 h-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting assignment</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              In Progress
            </CardTitle>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {stats.inProgress}
            </div>
            <p className="text-xs text-gray-500 mt-1">Being worked on</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Resolved
            </CardTitle>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats.resolved}
            </div>
            <p className="text-xs text-gray-foreground mt-1">
              Successfully fixed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Complaints */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Complaints
              <Link href="/citizen/complaints">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </CardTitle>
            <CardDescription>Your recently submitted issues</CardDescription>
          </CardHeader>
          <CardContent>
            {recentComplaints.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No complaints yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't submitted any complaints yet.
                </p>
                <Link href="/citizen/complaints/new">
                  <Button>
                    <Plus className="mr-2 w-4 h-4" />
                    Submit Your First Complaint
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentComplaints.map((complaint) => {
                  const colors = statusColor(complaint.status);
                  return (
                    <div
                      key={complaint.id}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className={cn("w-2 h-2 rounded-full mt-2", colors.dot)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {complaint.title}
                            </h4>
                            <p className="text-sm text-gray-500 truncate">
                              ID: {complaint.tracking_code}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "text-xs px-2 py-1 rounded-full font-medium capitalize whitespace-nowrap ml-2",
                              colors.pill
                            )}
                          >
                            {complaint.status.replace("_", " ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {complaint.ward_number
                              ? `Ward ${complaint.ward_number}`
                              : "Ward not set"}
                          </span>
                          <span>{formatDate(complaint.submitted_at)}</span>
                          {complaint.is_overdue && (
                            <span className="text-red-600 font-medium">
                              • Overdue
                            </span>
                          )}
                        </div>
                        {complaint.assigned_department_name && (
                          <div className="mt-2 text-xs text-gray-600">
                            Assigned to: {complaint.assigned_department_name}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/citizen/complaints/new" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Submit New Complaint
                </Button>
              </Link>
              <Link href="/citizen/complaints" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  View All Complaints
                </Button>
              </Link>
              <Link href="/citizen/notifications" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <div className="relative">
                    <Bell className="w-4 h-4 mr-2" />
                    {stats.unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </div>
                  Notifications
                  {stats.unreadNotifications > 0 && (
                    <span className="ml-auto bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      {stats.unreadNotifications} new
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/track" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <MapPin className="w-4 h-4 mr-2" />
                  Track Complaint
                </Button>
              </Link>
              <Link href="/citizen/profile" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  My Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Response Time</span>
                  <span className="text-sm font-semibold text-green-600">
                    {statsData?.avg_resolution_hours
                      ? `${Math.round(statsData.avg_resolution_hours)} hrs`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">SLA Compliance</span>
                  <span className="text-sm font-semibold text-green-600">
                    {statsData?.sla_compliance_rate
                      ? `${statsData.sla_compliance_rate}%`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Overdue</span>
                  <span className="text-sm font-semibold text-red-600">
                    {stats.overdue}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Satisfaction</span>
                  <span className="text-sm font-semibold text-yellow-600">
                    {statsData?.citizen_satisfaction
                      ? `${statsData.citizen_satisfaction}/5`
                      : "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tips & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tips Section */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">
              💡 Tips for Better Complaints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>
                  Include clear photos of the issue from multiple angles
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>
                  Provide exact location using map pin or GPS coordinates
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Add relevant landmarks for faster identification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Check existing complaints to avoid duplicates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>
                  Be specific about the issue and include any safety concerns
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Important Links */}
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">🔗 Important Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <a
                href="https://pokharamun.gov.np"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Pokhara Municipality</p>
                  <p className="text-xs text-gray-600">Official website</p>
                </div>
              </a>
              <Link
                href="/citizen/help"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Help Center</p>
                  <p className="text-xs text-gray-600">FAQs and guides</p>
                </div>
              </Link>
              <Link
                href="/citizen/feedback"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Feedback</p>
                  <p className="text-xs text-gray-600">Share your experience</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Real-time Updates
          </CardTitle>
          <CardDescription>Stay informed about your complaints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-blue-900">
                    Instant Notifications
                  </p>
                  <p className="text-sm text-blue-700">
                    Get notified when status changes
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-900">Live Tracking</p>
                  <p className="text-sm text-green-700">
                    Track resolution progress in real-time
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-purple-900">
                    Performance Analytics
                  </p>
                  <p className="text-sm text-purple-700">
                    View stats and resolution times
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
