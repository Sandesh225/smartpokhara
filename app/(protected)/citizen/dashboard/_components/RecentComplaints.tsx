import { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { FileText, ArrowUpRight, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Complaint } from "@/features/complaints";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  received: { label: "Logged", className: "bg-muted text-muted-foreground border-border" },
  under_review: { label: "Reviewing", className: "bg-accent/50 text-accent-foreground border-accent" },
  assigned: { label: "Delegated", className: "bg-primary/10 text-primary border-primary/20" },
  in_progress: { label: "Operating", className: "bg-secondary/10 text-secondary border-secondary/20 font-black animate-pulse" },
  resolved: { label: "Completed", className: "bg-secondary/10 text-secondary border-secondary/20" },
  closed: { label: "Archived", className: "bg-muted text-muted-foreground border-border" },
  reopened: { label: "Active", className: "bg-primary/10 text-primary border-primary/20" },
};

export default memo(function RecentComplaints({ complaints }: { complaints: Complaint[] }) {
  const getStatusConfig = (status: string) =>
    STATUS_CONFIG[status] || {
      label: status.replace(/_/g, " "),
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
          Filing Activity
        </CardTitle>
        <Link
          href="/citizen/complaints"
          className="font-heading text-xs font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 group"
        >
          Audit All
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        {complaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center mb-5 rotate-6 shadow-inner-lg border border-border/50">
              <FileText className="w-7 h-7 text-muted-foreground/40" aria-hidden="true" />
            </div>
            <h3 className="font-heading text-xs font-black uppercase tracking-widest text-foreground">Neutral Record</h3>
            <p className="font-sans text-xs font-bold text-muted-foreground uppercase tracking-tight mt-1 max-w-[240px] opacity-60">
              System awaits initial report entry. All previous datasets have been cleared.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {complaints.map((item, i) => {
              const statusConfig = getStatusConfig(item.status);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  <Link
                    href={`/citizen/complaints/${item.id}`}
                    className={cn(
                      "flex items-center justify-between gap-6 px-6 py-5 rounded-2xl mx-2 my-1",
                      "hover:bg-muted/40 transition-all duration-500 group outline-none",
                      "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/20"
                    )}
                    aria-label={`${item.title}, status: ${statusConfig.label}`}
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
                    <div className="flex items-center gap-5 min-w-0 flex-1 relative z-10">
                      {/* Tracking code chip */}
                      <div className="w-12 h-12 rounded-2xl border border-border/50 bg-background flex items-center justify-center shrink-0 shadow-inner-sm group-hover:border-primary/30 transition-all duration-500 group-hover:scale-110 group-hover:shadow-md">
                        <span className="font-heading text-xs font-black text-primary tabular-nums tracking-tighter">
                          #{item.tracking_code.split("-").pop()}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1 space-y-1.5 transition-transform duration-500 group-hover:translate-x-1">
                        <p className="font-heading text-xs font-black uppercase tracking-wide text-foreground truncate group-hover:text-primary transition-colors">
                          {item.title}
                        </p>
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="font-sans text-xs font-bold text-muted-foreground uppercase tracking-tight flex items-center gap-1.5 opacity-70">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            <span className="font-heading">{formatDistanceToNow(new Date(item.submitted_at))}</span> AGO
                          </span>
                          {item.address_text && (
                            <span className="font-sans text-xs font-bold text-muted-foreground uppercase tracking-tight flex items-center gap-1.5 truncate opacity-70">
                              <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                              <span className="truncate">{item.address_text}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Badge
                      className={cn(
                        "font-sans text-xs font-black uppercase tracking-wide px-3 py-1 rounded-lg border shadow-inner-sm whitespace-nowrap shrink-0 group-hover:shadow-md transition-all duration-500 relative z-10 group-hover:-translate-x-1",
                        statusConfig.className
                      )}
                    >
                      {statusConfig.label}
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
