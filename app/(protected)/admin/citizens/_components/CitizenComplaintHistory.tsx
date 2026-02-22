// ═══════════════════════════════════════════════════════════
// app/admin/citizens/_components/ComplaintHistory.tsx
// ═══════════════════════════════════════════════════════════

import { ComplaintHistoryItem } from "@/features/users/types";
import { format } from "date-fns";
import Link from "next/link";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  received: "bg-muted text-foreground border-border",
  under_review: "bg-info-blue/10 text-info-blue border-info-blue/30",
  in_progress: "bg-warning-amber/10 text-warning-amber border-warning-amber/30",
  resolved: "bg-success-green/10 text-success-green border-success-green/30",
  closed: "bg-muted text-muted-foreground border-border",
  rejected: "bg-error-red/10 text-error-red border-error-red/30",
};

export default function ComplaintHistory({
  complaints,
}: {
  complaints: ComplaintHistoryItem[];
}) {
  return (
    <div className="stone-card overflow-hidden">
      {/* HEADER */}
      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-border bg-muted/30 flex items-center justify-between">
        <h3 className="font-bold text-sm md:text-base text-foreground">
          Complaint History
        </h3>
        <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/30">
          {complaints.length} Total
        </span>
      </div>

      {/* CONTENT */}
      <div className="max-h-[350px] md:max-h-[400px] overflow-y-auto custom-scrollbar">
        {complaints.length === 0 ? (
          <div className="p-8 md:p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-sm text-muted-foreground">No complaints found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {complaints.map((c) => (
              <div
                key={c.id}
                className="p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs text-primary font-bold mb-1">
                      {c.tracking_code}
                    </p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {c.category?.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(c.submitted_at), "MMM d, yyyy")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border whitespace-nowrap",
                        statusColors[c.status] || "bg-muted"
                      )}
                    >
                      {c.status.replace("_", " ")}
                    </span>
                    <Link
                      href={`/admin/complaints/${c.id}`}
                      className="text-xs font-bold text-primary hover:underline whitespace-nowrap"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
