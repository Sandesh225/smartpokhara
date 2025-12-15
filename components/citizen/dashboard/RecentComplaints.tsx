"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ArrowRight, Clock } from "lucide-react"
import type { Complaint } from "@/lib/types/database.types"

interface RecentComplaintsProps {
  complaints: Complaint[]
}

const statusColors: Record<string, string> = {
  received: "bg-gray-100 text-gray-800",
  under_review: "bg-blue-100 text-blue-800",
  assigned: "bg-purple-100 text-purple-800",
  in_progress: "bg-amber-100 text-amber-800",
  resolved: "bg-emerald-100 text-emerald-800",
  closed: "bg-slate-100 text-slate-800",
  rejected: "bg-red-100 text-red-800",
}

export default function RecentComplaints({ complaints }: RecentComplaintsProps) {
  return (
    <Card className="col-span-1 shadow-md border-gray-200" role="region" aria-label="Recent complaints">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" aria-hidden="true" />
            Recent Complaints
          </CardTitle>
          <CardDescription className="mt-1">Track the status of your reported issues</CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Link href="/citizen/complaints" className="text-primary font-semibold">
            View All <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {complaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center space-y-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 rounded-2xl border-2 border-blue-100 border-dashed">
            <div className="p-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl animate-in fade-in-50 zoom-in-95 duration-500">
              <FileText className="h-12 w-12 text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="text-gray-900 font-bold text-xl mb-1">No complaints found</p>
              <p className="text-sm text-gray-600 mb-5 max-w-xs">
                Have an issue in your area? Report it now and we'll get it resolved.
              </p>
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <Link href="/citizen/complaints/new">Submit Complaint</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3" role="list">
            {complaints.map((complaint) => (
              <Link
                href={`/citizen/complaints/${complaint.id}`}
                key={complaint.id}
                className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
                role="listitem"
              >
                <div className="flex items-start justify-between p-4 rounded-xl border-2 bg-card hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group-hover:border-blue-300 group-hover:shadow-lg group-hover:-translate-y-0.5">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 rounded-lg font-bold shadow-sm group-hover:shadow-md transition-shadow">
                        {complaint.tracking_code}
                      </span>
                      <h4 className="font-bold line-clamp-1 group-hover:text-blue-700 transition-colors duration-200">
                        {complaint.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="font-medium">{formatDistanceToNow(new Date(complaint.submitted_at))} ago</span>
                      <span aria-hidden="true">•</span>
                      <span>Ward {complaint.ward_id || "N/A"}</span>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${statusColors[complaint.status] || "bg-gray-100"} capitalize border-0 font-bold shadow-sm text-xs px-3 py-1 whitespace-nowrap`}
                  >
                    {complaint.status.replace("_", " ")}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
