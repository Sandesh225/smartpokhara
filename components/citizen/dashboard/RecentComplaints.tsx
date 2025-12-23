"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  FileText,
  ArrowRight,
  Clock,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function RecentComplaints({
  complaints,
}: {
  complaints: any[];
}) {
  return (
    <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white ring-1 ring-slate-900/5 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
        <CardTitle className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <FileText className="w-5 h-5" />
          </div>
          Recent Activity
        </CardTitle>
        <Link
          href="/citizen/complaints"
          className="text-xs font-black text-blue-600 hover:underline flex items-center gap-1 uppercase tracking-widest"
        >
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <div className="space-y-3">
          {complaints.map((item, i) => (
            <Link key={item.id} href={`/citizen/complaints/${item.id}`}>
              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-50 hover:border-blue-100 hover:bg-blue-50/30 transition-all group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-black text-slate-400">
                      #{item.tracking_code.split("-").pop()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-bold text-slate-900 truncate">
                      {item.title}
                    </h5>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3" />{" "}
                      {formatDistanceToNow(new Date(item.submitted_at))} ago
                    </p>
                  </div>
                </div>
                <Badge className="rounded-lg px-3 py-1 font-black text-[10px] uppercase border-0 shadow-none bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {item.status.replace("_", " ")}
                </Badge>
              </motion.div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}