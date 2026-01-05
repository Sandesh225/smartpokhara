import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface MonthlyData {
  complaints: any[];
  bills: any[];
  payments: any[];
}

export default function MonthlyReport({ data }: { data: MonthlyData }) {
  const totalComplaints = data.complaints.length;
  const resolved = data.complaints.filter((c) =>
    ["resolved", "closed"].includes(c.status)
  ).length;
  const resolutionRate =
    totalComplaints > 0 ? Math.round((resolved / totalComplaints) * 100) : 0;

  const totalRevenue = data.payments.reduce(
    (sum, p) => sum + Number(p.amount_paid),
    0
  );
  const pendingBills = data.bills.filter((b) => b.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stone-card p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold px-2 py-1 bg-white rounded-full border text-primary">
              {resolutionRate}% Rate
            </span>
          </div>
          <div className="text-3xl font-bold text-foreground">
            {totalComplaints}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Total Complaints</p>
        </div>

        <div className="stone-card p-6 bg-gradient-to-br from-green-50 to-transparent border-green-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-100 rounded-lg text-green-700">
              <DollarSign className="w-6 h-6" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-foreground">
            Rs. {totalRevenue.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Revenue Collected
          </p>
        </div>

        <div className="stone-card p-6 bg-gradient-to-br from-amber-50 to-transparent border-amber-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-amber-800">
              Action Needed
            </span>
          </div>
          <div className="text-3xl font-bold text-foreground">
            {pendingBills}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Pending Bill Payments
          </p>
        </div>
      </div>

      {/* Mini Charts Visualization (CSS-based) */}
      <div className="stone-card p-6">
        <h4 className="font-bold text-lg mb-6">Complaint Status Breakdown</h4>
        <div className="space-y-4">
          {["received", "in_progress", "resolved", "closed"].map((status) => {
            const count = data.complaints.filter(
              (c) => c.status === status
            ).length;
            const pct =
              totalComplaints > 0 ? (count / totalComplaints) * 100 : 0;
            return (
              <div key={status}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize font-medium text-foreground">
                    {status.replace("_", " ")}
                  </span>
                  <span className="text-muted-foreground">
                    {count} ({Math.round(pct)}%)
                  </span>
                </div>
                <div className="w-full bg-neutral-stone-100 rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, opacity: pct > 0 ? 1 : 0.3 }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
