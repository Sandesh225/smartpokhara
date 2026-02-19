"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { FileText, ArrowRight, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Complaint } from "@/features/complaints";

// Local Complaint interface removed

export default function RecentComplaints({
  complaints,
}: {
  complaints: Complaint[];
}) {
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      received:
        "bg-neutral-stone-200 dark:bg-neutral-stone-700 text-neutral-stone-800 dark:text-neutral-stone-200",
      under_review:
        "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300",
      assigned:
        "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300",
      in_progress:
        "bg-secondary/20 dark:bg-secondary/30 text-[rgb(43,95,117)] dark:text-secondary",
      resolved:
        "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300",
      closed:
        "bg-neutral-stone-200 dark:bg-neutral-stone-700 text-neutral-stone-800 dark:text-neutral-stone-300",
      reopened:
        "bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300",
    };
    return (
      statusMap[status] ||
      "bg-neutral-stone-200 dark:bg-neutral-stone-700 text-neutral-stone-800 dark:text-neutral-stone-200"
    );
  };

  return (
    <Card className="stone-card elevation-3 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-7 pb-5 bg-linear-to-br from-neutral-stone-50 to-white dark:from-dark-midnight dark:to-dark-surface">
        <CardTitle className="text-2xl font-black tracking-tight text-foreground flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/15 dark:bg-primary/20 flex items-center justify-center text-primary elevation-1">
            <FileText className="w-6 h-6" />
          </div>
          Recent Activity
        </CardTitle>
        <Link
          href="/citizen/complaints"
          className="text-xs font-black text-primary hover:text-primary-brand-dark hover:underline flex items-center gap-2 uppercase tracking-widest transition-all"
        >
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </CardHeader>
      <CardContent className="p-7 pt-4">
        {complaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-5 bg-muted dark:bg-dark-surface-elevated rounded-2xl mb-5 elevation-1">
              <FileText className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-sm font-bold text-muted-foreground">
              No recent activity
            </p>
            <p className="text-xs text-muted-foreground/80 mt-2 font-medium">
              Your submitted complaints will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((item, i) => (
              <Link key={item.id} href={`/citizen/complaints/${item.id}`}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  whileHover={{ x: 6, scale: 1.01 }}
                  className="flex items-center justify-between p-5 rounded-xl border-2 border-neutral-stone-200 dark:border-dark-border-primary hover:border-primary/40 dark:hover:border-primary/50 hover:bg-neutral-stone-50 dark:hover:bg-dark-surface-elevated transition-all group elevation-1 hover:elevation-2"
                >
                  <div className="flex items-center gap-5 min-w-0 flex-1">
                    <div className="h-14 w-14 rounded-xl bg-white dark:bg-dark-surface-elevated border-2 border-neutral-stone-200 dark:border-dark-border-secondary flex items-center justify-center shrink-0 elevation-1 group-hover:elevation-2 transition-all">
                      <span className="text-xs font-black text-neutral-stone-600 dark:text-dark-text-secondary font-mono tabular-nums">
                        #{item.tracking_code.split("-").pop()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="font-black text-foreground truncate text-balance text-base">
                        {item.title}
                      </h5>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" />{" "}
                          {formatDistanceToNow(new Date(item.submitted_at))} ago
                        </p>
                        {item.address_text && (
                          <>
                            <span className="text-neutral-stone-300 dark:text-dark-border-primary">
                              •
                            </span>
                            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" /> {item.address_text}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      "rounded-xl px-4 py-2 font-black text-xs uppercase border-0 shadow-sm transition-all",
                      "group-hover:scale-105",
                      getStatusColor(item.status)
                    )}
                  >
                    {item.status.replace("_", " ")}
                  </Badge>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}