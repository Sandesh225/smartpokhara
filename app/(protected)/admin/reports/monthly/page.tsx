import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import MonthlyReport from "../_components/MonthlyReport";
import ExportOptions from "../_components/ExportOptions";
import { getMonthlyStats } from "../actions";

export default async function MonthlyReportPage() {
  const date = new Date();
  const monthName = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();

  // Fetch real data for current month
  const data = await getMonthlyStats(year, date.getMonth() + 1);

  return (
    <div className="min-h-screen bg-background section-spacing container-padding">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Link
              href="/admin/reports"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-2 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-foreground">
              {monthName} {year} Report
            </h1>
          </div>
          <ExportOptions />
        </div>

        <MonthlyReport data={data} />
      </div>
    </div>
  );
}
