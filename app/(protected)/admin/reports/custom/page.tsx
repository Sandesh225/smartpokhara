import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ReportBuilder from "../_components/ReportBuilder";

export default function CustomReportPage() {
  return (
    <div className="min-h-screen bg-background section-spacing container-padding">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link
            href="/admin/reports"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            Create Custom Report
          </h1>
        </div>

        <ReportBuilder />
      </div>
    </div>
  );
}
