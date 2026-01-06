"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { FileText, ArrowRight, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Complaint {
  id: string;
  tracking_code: string;
  title: string;
  submitted_at: string;
  status: string;
  location?: string;
}

export default function RecentComplaints({
  complaints,
}: {
  complaints: Complaint[];
}) {
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      received: "bg-[rgb(229,231,235)] text-[rgb(55,65,81)]",
      under_review: "bg-amber-100 text-amber-800",
      assigned: "bg-cyan-100 text-cyan-800",
      in_progress: "bg-[rgb(95,158,160)]/20 text-[rgb(43,95,117)]",
      resolved: "bg-emerald-100 text-emerald-800",
      closed: "bg-[rgb(209,213,219)] text-[rgb(55,65,81)]",
      reopened: "bg-rose-100 text-rose-800",
    };
    return statusMap[status] || "bg-[rgb(229,231,235)] text-[rgb(55,65,81)]";
  };

  return (
    <Card className="stone-card elevation-4 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-6 pb-4 bg-gradient-to-br from-[rgb(249,250,251)] to-white">
        <CardTitle className="text-2xl font-black tracking-tight text-[rgb(26,32,44)] flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[rgb(43,95,117)]/10 flex items-center justify-center text-[rgb(43,95,117)] elevation-1">
            <FileText className="w-5 h-5" />
          </div>
          Recent Activity
        </CardTitle>
        <Link
          href="/citizen/complaints"
          className="text-xs font-bold text-[rgb(43,95,117)] hover:text-[rgb(27,47,59)] hover:underline flex items-center gap-1 uppercase tracking-widest transition-colors"
        >
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </CardHeader>
      <CardContent className="p-6 pt-2">
        {complaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-[rgb(244,245,247)] rounded-2xl mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              No recent activity
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Your submitted complaints will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((item, i) => (
              <Link key={item.id} href={`/citizen/complaints/${item.id}`}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  whileHover={{ x: 4, scale: 1.01 }}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-[rgb(244,245,247)] hover:border-[rgb(43,95,117)]/30 hover:bg-[rgb(249,250,251)] transition-all group elevation-1 hover:elevation-2"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="h-12 w-12 rounded-xl bg-white border-2 border-[rgb(229,231,235)] flex items-center justify-center shrink-0 elevation-1 group-hover:elevation-2 transition-all">
                      <span className="text-[11px] font-black text-[rgb(107,114,128)] font-mono tabular-nums">
                        #{item.tracking_code.split("-").pop()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-[rgb(26,32,44)] truncate text-balance">
                        {item.title}
                      </h5>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <p className="text-[10px] font-semibold text-[rgb(107,114,128)] uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />{" "}
                          {formatDistanceToNow(new Date(item.submitted_at))} ago
                        </p>
                        {item.location && (
                          <>
                            <span className="text-[rgb(209,213,219)]">•</span>
                            <p className="text-[10px] font-medium text-[rgb(107,114,128)] flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {item.location}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      "rounded-lg px-3 py-1.5 font-black text-[10px] uppercase border-0 shadow-sm transition-all",
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
