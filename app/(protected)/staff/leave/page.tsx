import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { staffLeaveQueries } from "@/lib/supabase/queries/staff-leave";
import { Plus, Calendar, Clock, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function LeaveDashboardPage() {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const [balance, requests] = await Promise.all([
    staffLeaveQueries.getMyBalance(supabase, user.id),
    staffLeaveQueries.getMyRequests(supabase, user.id),
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your time off and submit new requests.
          </p>
        </div>

        <Link
          href="/staff/leave/request"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-blue-200 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>New Request</span>
        </Link>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BalanceCard
          title="Casual Leave"
          total={balance.casual_total}
          used={balance.casual_used}
          color="blue"
        />
        <BalanceCard
          title="Sick Leave"
          total={balance.sick_total}
          used={balance.sick_used}
          color="emerald"
        />
        <BalanceCard
          title="Annual Leave"
          total={balance.annual_total}
          used={balance.annual_used}
          color="purple"
        />
      </div>

      {/* Request History */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-900">Request History</h3>
        </div>

        <div className="divide-y divide-gray-100">
          {requests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No leave requests found.
            </div>
          ) : (
            requests.map((req: any) => (
              <div
                key={req.id}
                className="p-4 sm:px-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <StatusIcon status={req.status} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900 capitalize">
                        {req.leave_type} Leave
                      </h4>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md font-medium">
                        {req.total_days} {req.total_days === 1 ? "Day" : "Days"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(req.start_date), "MMM d, yyyy")} -{" "}
                      {format(new Date(req.end_date), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="text-right">
                    <p
                      className={`font-bold uppercase text-xs tracking-wider ${getStatusColor(
                        req.status
                      )}`}
                    >
                      {req.status}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Applied {format(new Date(req.created_at), "MMM d")}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function BalanceCard({
  title,
  total,
  used,
  color,
}: {
  title: string;
  total: number;
  used: number;
  color: string;
}) {
  const remaining = total - used;
  const percentage = (used / total) * 100;

  const colors: any = {
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-gray-900 tabular-nums">
            {remaining}
          </h3>
        </div>
        <div
          className={`h-10 w-10 rounded-full flex items-center justify-center ${colors[color]}`}
        >
          <Calendar className="w-5 h-5 opacity-80" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              color === "blue"
                ? "bg-blue-500"
                : color === "emerald"
                ? "bg-emerald-500"
                : "bg-purple-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs font-medium text-gray-500">
          <span>Used: {used}</span>
          <span>Total: {total}</span>
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "approved":
      return (
        <div className="p-2 bg-green-50 rounded-full">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        </div>
      );
    case "rejected":
      return (
        <div className="p-2 bg-red-50 rounded-full">
          <XCircle className="w-5 h-5 text-red-600" />
        </div>
      );
    default:
      return (
        <div className="p-2 bg-amber-50 rounded-full">
          <Clock className="w-5 h-5 text-amber-600" />
        </div>
      );
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "approved":
      return "text-green-600";
    case "rejected":
      return "text-red-600";
    default:
      return "text-amber-600";
  }
}
