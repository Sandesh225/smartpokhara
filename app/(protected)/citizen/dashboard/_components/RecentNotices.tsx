"use client";

import { memo } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { FileText, ArrowUpRight, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProjectNotice } from "@/features/notices/types";

const NOTICE_TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  general: { label: "General", className: "bg-muted text-muted-foreground border-border" },
  emergency: { label: "Emergency", className: "bg-destructive text-destructive-foreground border-destructive" },
  project: { label: "Project", className: "bg-primary text-primary-foreground border-primary" },
  public_holiday: { label: "Calendar", className: "bg-secondary text-secondary-foreground border-secondary" },
};

export default memo(function RecentNotices({ notices }: { notices: ProjectNotice[] }) {
  const getNoticeTypeConfig = (type: string) => 
    NOTICE_TYPE_CONFIG[type] || {
      label: type.replace(/_/g, " "),
      className: "bg-muted text-muted-foreground border-border",
    };

  return (
    <Card className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm h-full transition-all duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2.5">
          <div className="p-1.5 bg-primary text-primary-foreground rounded-xl">
            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          Public Announcements
        </CardTitle>
        <Link
          href="/citizen/notices"
          className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 group"
        >
          View All
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        {notices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-muted-foreground/30" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">No Notices</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
              No active municipal broadcasts at this time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notices.map((item, i) => {
              const config = getNoticeTypeConfig(item.notice_type);
              return (
                <div
                  key={item.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 75}ms` }}
                >
                  <Link
                    href={`/citizen/notices/${item.id}`}
                    className={cn(
                      "flex items-center justify-between gap-4 px-5 sm:px-6 py-4",
                      "hover:bg-muted/50 transition-all duration-200 group outline-none",
                      "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    )}
                    aria-label={`${item.title}, type: ${config.label}`}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-muted border border-border/50 flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-200">
                        <FileText className="w-4 h-4" />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors duration-200">
                          {item.title}
                        </p>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" aria-hidden="true" />
                          {formatDistanceToNow(new Date(item.published_at))} ago
                        </span>
                      </div>
                    </div>

                    <Badge
                      className={cn(
                        "text-xs font-medium px-2.5 py-0.5 rounded-lg border whitespace-nowrap shrink-0",
                        config.className
                      )}
                    >
                      {config.label}
                    </Badge>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
});