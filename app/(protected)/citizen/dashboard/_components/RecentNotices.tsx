"use client";

import { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { FileText, ArrowUpRight, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProjectNotice } from "@/features/notices/types";

const NOTICE_TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  general: { label: "General", className: "bg-muted text-muted-foreground border-border" },
  emergency: { label: "Emergency", className: "bg-destructive/10 text-destructive border-destructive/20" },
  project: { label: "Project", className: "bg-primary/10 text-primary border-primary/20" },
  public_holiday: { label: "Calendar", className: "bg-secondary/10 text-secondary border-secondary/20" },
};

export default memo(function RecentNotices({ notices }: { notices: ProjectNotice[] }) {
  const getNoticeTypeConfig = (type: string) => 
    NOTICE_TYPE_CONFIG[type] || {
      label: type.replace(/_/g, " "),
      className: "bg-muted text-muted-foreground border-border",
    };

  return (
    <Card className="bg-card/95 backdrop-blur-sm border border-border/60 rounded-3xl overflow-hidden shadow-inner-lg h-full transition-all duration-500 hover:shadow-xl relative group/card">
      <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none" />
      <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border/50 bg-muted/10 relative z-10">
        <CardTitle className="font-heading text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-2.5">
          <div className="p-1.5 bg-primary/10 text-primary rounded-xl border border-primary/20">
            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          Public Announcements
        </CardTitle>
        <Link
          href="/citizen/notices"
          className="font-heading text-xs font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 group"
        >
          View Stream
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        {notices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center mb-5 -rotate-3 shadow-inner-lg border border-border/50">
              <FileText className="w-7 h-7 text-muted-foreground/30" aria-hidden="true" />
            </div>
            <h3 className="font-heading text-xs font-black uppercase tracking-widest text-foreground">Records Updated</h3>
            <p className="font-sans text-xs font-bold text-muted-foreground uppercase tracking-tight mt-1 max-w-[220px] opacity-60">
              There are no active municipal broadcasts requiring your attention at this time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {notices.map((item, i) => {
              const config = getNoticeTypeConfig(item.notice_type);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  <Link
                    href={`/citizen/notices/${item.id}`}
                    className={cn(
                      "flex items-center justify-between gap-6 px-6 py-5 rounded-2xl mx-2 my-1",
                      "hover:bg-muted/40 transition-all duration-500 group outline-none",
                      "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/20"
                    )}
                    aria-label={`${item.title}, type: ${config.label}`}
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
                    <div className="flex items-center gap-5 min-w-0 flex-1 relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-background border border-border/50 flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary shadow-inner-sm group-hover:shadow-md group-hover:-rotate-3">
                        <FileText className="w-5 h-5 transition-transform duration-500 group-hover:scale-110" />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1 transition-transform duration-500 group-hover:translate-x-1">
                        <p className="font-heading text-xs font-black uppercase tracking-wide text-foreground truncate group-hover:text-primary transition-colors">
                          {item.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1 cursor-default">
                          <span className="font-sans text-xs font-bold text-muted-foreground uppercase tracking-tight flex items-center gap-1.5 opacity-60">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            <span className="font-heading">{formatDistanceToNow(new Date(item.published_at))}</span> AGO
                          </span>
                        </div>
                      </div>
                    </div>

                    <Badge
                      className={cn(
                        "font-sans text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border shadow-inner-sm whitespace-nowrap shrink-0 group-hover:shadow-md transition-all duration-500 relative z-10 group-hover:-translate-x-1",
                        config.className
                      )}
                    >
                      {config.label}
                    </Badge>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
});