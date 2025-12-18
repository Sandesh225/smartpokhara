"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Complaint } from "@/lib/types/database.types";

interface RecentComplaintsProps {
  complaints: Complaint[];
}

const statusColors: Record<string, string> = {
  received: "bg-gray-100 text-gray-800 border-gray-200",
  under_review: "bg-blue-100 text-blue-800 border-blue-200",
  assigned: "bg-purple-100 text-purple-800 border-purple-200",
  in_progress: "bg-amber-100 text-amber-800 border-amber-200",
  resolved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  closed: "bg-slate-100 text-slate-800 border-slate-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

export default function RecentComplaints({
  complaints,
}: RecentComplaintsProps) {
  return (
    <Card
      className="col-span-1 shadow-md border-2 border-border hover:shadow-lg transition-shadow duration-300"
      role="region"
      aria-label="Recent complaints overview"
    >
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-700" aria-hidden="true" />
            </div>
            <span>Recent Complaints</span>
          </CardTitle>
          <CardDescription className="text-sm mt-1">
            Track the status of your reported issues
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 font-semibold flex-shrink-0"
        >
          <Link href="/citizen/complaints" className="text-primary">
            View All <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {complaints.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-14 px-4 text-center space-y-4 bg-linear-to-br from-blue-50 via-indigo-50 to-blue-50 rounded-2xl border-2 border-blue-200 border-dashed"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="p-5 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl"
            >
              <FileText className="h-12 w-12 text-white" aria-hidden="true" />
            </motion.div>
            <div>
              <h3 className="text-gray-900 font-bold text-xl mb-2">
                No complaints found
              </h3>
              <p className="text-sm text-gray-600 mb-6 max-w-xs leading-relaxed">
                Have an issue in your area? Report it now and we'll get it
                resolved.
              </p>
              <Button
                asChild
                className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 font-semibold"
              >
                <Link href="/citizen/complaints/new">Submit Complaint</Link>
              </Button>
            </div>
          </motion.div>
        ) : (
          <div
            className="space-y-3"
            role="list"
            aria-label="List of recent complaints"
          >
            {complaints.map((complaint, index) => (
              <motion.div
                key={complaint.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                whileHover={{ x: 4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={`/citizen/complaints/${complaint.id}`}
                  className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
                  role="listitem"
                  aria-label={`Complaint ${complaint.tracking_code}: ${complaint.title}, status ${complaint.status.replace("_", " ")}`}
                >
                  <div className="flex items-start justify-between p-4 rounded-xl border-2 bg-card hover:bg-linear-to-br hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-300 group-hover:border-blue-300 group-hover:shadow-lg">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-white bg-linear-to-r from-blue-600 to-indigo-600 px-3 py-1.5 rounded-lg font-bold shadow-sm group-hover:shadow-md transition-shadow">
                          {complaint.tracking_code}
                        </span>
                        <h4 className="font-bold text-sm sm:text-base line-clamp-1 group-hover:text-blue-700 transition-colors duration-200">
                          {complaint.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock
                          className="h-3.5 w-3.5 flex-shrink-0"
                          aria-hidden="true"
                        />
                        <span className="font-medium">
                          {formatDistanceToNow(
                            new Date(complaint.submitted_at)
                          )}{" "}
                          ago
                        </span>
                        <span aria-hidden="true">•</span>
                        <span>Ward {complaint.ward_id || "N/A"}</span>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        statusColors[complaint.status] ||
                          "bg-gray-100 text-gray-800 border-gray-200",
                        "capitalize border font-bold shadow-sm text-xs px-3 py-1 whitespace-nowrap ml-3 flex-shrink-0"
                      )}
                    >
                      {complaint.status.replace("_", " ")}
                    </Badge>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
