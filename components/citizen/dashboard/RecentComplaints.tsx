"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { FileText, ArrowRight, Clock, MapPin, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/shared";
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
  return (
    <div className="stone-card bg-card/40 backdrop-blur-xl rounded-[40px] border border-border/40 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-left-8 duration-1000">
      {/* Header */}
      <div className="flex items-center justify-between p-8 sm:p-10 border-b border-border/40 relative">
        <div className="absolute inset-0 bg-primary/5 opacity-50" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
            <FileText className="w-7 h-7 text-primary" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xl font-black text-foreground tracking-tight uppercase">Operational Logs</h3>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">
              Active Registry • Recent Filings
            </p>
          </div>
        </div>
        <Link
          href="/citizen/complaints"
          className="group h-12 px-6 flex items-center gap-3 bg-card border border-border/40 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all duration-500 shadow-sm relative z-10"
        >
          View Registry <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Content */}
      <div className="p-8 sm:p-10">
        {complaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-24 w-24 bg-muted/20 rounded-[32px] flex items-center justify-center mb-8 border border-border/20 shadow-inner group/empty hover:rotate-12 transition-all duration-700">
              <FileText className="w-10 h-10 text-muted-foreground/40 group-hover:text-primary/40 transition-colors" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Registry Empty • No Active Activity
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {complaints.map((item, i) => (
              <Link key={item.id} href={`/citizen/complaints/${item.id}`}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  whileHover={{ scale: 1.02, x: 10 }}
                  className="flex items-center justify-between p-6 rounded-[28px] border border-border/40 bg-card/40 hover:bg-card/80 hover:border-primary/20 transition-all duration-500 group shadow-lg"
                >
                  <div className="flex items-center gap-6 min-w-0 flex-1">
                    <div className="h-16 w-16 rounded-2xl bg-muted/30 border border-border/40 flex items-center justify-center shrink-0 group-hover:border-primary/40 group-hover:bg-primary/5 transition-all duration-500 shadow-inner">
                      <span className="text-[10px] font-black text-muted-foreground/60 font-mono tracking-tighter tabular-nums group-hover:text-primary transition-colors">
                        CID-{item.tracking_code.split("-").pop()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-base font-black text-foreground tracking-tight truncate uppercase leading-none mb-3 dark:text-glow">
                        {item.title}
                      </h5>
                      <div className="flex items-center gap-5">
                        <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDistanceToNow(new Date(item.submitted_at))} AGO
                        </p>
                        {item.location && (
                          <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5" /> {item.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-4">
                    <StatusBadge
                      status={item.status}
                      variant="complaint"
                      className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl shadow-sm group-hover:shadow-md transition-all scale-100 group-hover:scale-110"
                    />
                    <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
