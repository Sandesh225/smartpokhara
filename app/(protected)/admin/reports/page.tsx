import Link from "next/link";
import { FileText, PlusCircle, BarChart3, CalendarDays } from "lucide-react";
import ReportScheduler from "./_components/ReportScheduler";

export default async function ReportsPage() {
  return (
    <div className="min-h-screen bg-background section-spacing container-padding">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary tracking-tight">
          Reports & Analytics
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Generate insights, track performance, and automate delivery.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Actions Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/admin/reports/monthly"
              className="stone-card p-6 hover:border-primary transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Monthly Overview</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Comprehensive summary of city performance for the current month.
              </p>
            </Link>

            <Link
              href="/admin/reports/custom"
              className="stone-card p-6 hover:border-accent transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 mb-4 group-hover:scale-110 transition-transform">
                <PlusCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Custom Report</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Build specific reports by filtering data sources, dates, and
                wards.
              </p>
            </Link>
          </div>

          {/* Recent Reports Table */}
          <div className="stone-card p-0 overflow-hidden">
            <div className="p-4 border-b border-border bg-neutral-stone-50 font-semibold">
              Recent Generated Reports
            </div>
            <table className="w-full text-sm text-left">
              <thead className="text-muted-foreground bg-neutral-stone-50/50">
                <tr>
                  <th className="p-4 font-medium">Report Name</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="hover:bg-neutral-stone-50">
                    <td className="p-4 font-medium">
                      Financial_Summary_Q{i}.pdf
                    </td>
                    <td className="p-4 text-muted-foreground">
                      Jan {10 + i}, 2024
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-neutral-100 rounded text-xs">
                        Finance
                      </span>
                    </td>
                    <td className="p-4 text-right text-primary cursor-pointer hover:underline">
                      Download
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <ReportScheduler />

          <div className="stone-card p-6 bg-primary text-white">
            <CalendarDays className="w-8 h-8 mb-4 opacity-80" />
            <h4 className="font-bold text-lg">Fiscal Year End</h4>
            <p className="text-sm opacity-90 mt-2 mb-4">
              The fiscal year ends in 45 days. Ensure all departmental audits
              are submitted.
            </p>
            <button className="w-full py-2 bg-white text-primary font-bold rounded-lg text-sm">
              View Checklist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
