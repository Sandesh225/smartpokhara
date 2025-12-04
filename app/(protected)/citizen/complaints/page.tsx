// app/(protected)/citizen/complaints/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { getMyComplaints } from "@/app/actions/complaint";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  Building,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ComplaintsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const status = searchParams.status as
    | "all"
    | "active"
    | "pending"
    | "resolved"
    | undefined;

  // Map status param to complaint_status array
  const statusFilter = {
    all: undefined,
    active: ["submitted", "received", "assigned", "accepted", "in_progress"],
    pending: ["submitted", "received"],
    resolved: ["resolved", "closed"],
  }[status || "all"];

  const { data: complaints = [] } = await getMyComplaints({
    status: statusFilter,
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) =>
      ["submitted", "received"].includes(c.status)
    ).length,
    inProgress: complaints.filter((c) =>
      ["assigned", "accepted", "in_progress"].includes(c.status)
    ).length,
    resolved: complaints.filter((c) =>
      ["resolved", "closed"].includes(c.status)
    ).length,
    overdue: complaints.filter(
      (c) =>
        c.is_overdue && !["resolved", "closed", "rejected"].includes(c.status)
    ).length,
  };

  const statusBadgeConfig = {
    draft: { variant: "outline", label: "Draft" },
    submitted: { variant: "secondary", label: "Submitted" },
    received: { variant: "secondary", label: "Received" },
    assigned: { variant: "default", label: "Assigned" },
    accepted: { variant: "default", label: "Accepted" },
    in_progress: { variant: "default", label: "In Progress" },
    resolved: { variant: "success", label: "Resolved" },
    closed: { variant: "success", label: "Closed" },
    rejected: { variant: "destructive", label: "Rejected" },
    reopened: { variant: "warning", label: "Reopened" },
  };

  const priorityColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
    critical: "bg-purple-100 text-purple-800",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Complaints</h1>
          <p className="text-muted-foreground">
            Track and manage all your submitted complaints
          </p>
        </div>
        <Link href="/citizen/complaints/new">
          <Button>
            <Plus className="mr-2 w-4 h-4" />
            New Complaint
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  In Progress
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.inProgress}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Resolved
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.resolved}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Overdue
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.overdue}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Complaints</CardTitle>
              <CardDescription>
                View and track all your submitted complaints
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 w-4 h-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Search className="mr-2 w-4 h-4" />
                Search
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={status || "all"}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" asChild>
                <Link href="/citizen/complaints">All</Link>
              </TabsTrigger>
              <TabsTrigger value="active" asChild>
                <Link href="/citizen/complaints?status=active">Active</Link>
              </TabsTrigger>
              <TabsTrigger value="pending" asChild>
                <Link href="/citizen/complaints?status=pending">Pending</Link>
              </TabsTrigger>
              <TabsTrigger value="resolved" asChild>
                <Link href="/citizen/complaints?status=resolved">Resolved</Link>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={status || "all"} className="mt-6">
              {complaints.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No complaints found</h3>
                  <p className="text-muted-foreground mb-6">
                    {status === "all"
                      ? "You haven't submitted any complaints yet."
                      : `No ${status} complaints found.`}
                  </p>
                  <Link href="/citizen/complaints/new">
                    <Button>
                      <Plus className="mr-2 w-4 h-4" />
                      Submit Your First Complaint
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tracking Code</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Ward</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>SLA Due</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {complaints.map((complaint) => (
                        <TableRow key={complaint.id}>
                          <TableCell className="font-mono text-sm">
                            {complaint.tracking_code}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">
                              {complaint.title}
                            </div>
                          </TableCell>
                          <TableCell>{complaint.category_name}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                statusBadgeConfig[complaint.status]
                                  ?.variant as any
                              }
                            >
                              {statusBadgeConfig[complaint.status]?.label}
                            </Badge>
                            {complaint.is_overdue && (
                              <Badge variant="destructive" className="ml-2">
                                Overdue
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={priorityColors[complaint.priority]}
                            >
                              {complaint.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              Ward {complaint.ward_number}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDistanceToNow(
                                new Date(complaint.submitted_at),
                                { addSuffix: true }
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {complaint.sla_due_at
                                ? formatDistanceToNow(
                                    new Date(complaint.sla_due_at),
                                    {
                                      addSuffix: true,
                                    }
                                  )
                                : "Not set"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Link
                                href={`/citizen/complaints/${complaint.id}`}
                              >
                                <Button variant="ghost" size="sm">
                                  View
                                </Button>
                              </Link>
                              {["resolved", "closed"].includes(
                                complaint.status
                              ) &&
                                !complaint.citizen_satisfaction_rating && (
                                  <Link
                                    href={`/citizen/complaints/${complaint.id}#feedback`}
                                  >
                                    <Button variant="outline" size="sm">
                                      Feedback
                                    </Button>
                                  </Link>
                                )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
