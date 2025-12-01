"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComplaintStatusBadge } from "@/components/citizen/complaints/ComplaintStatusBadge";
import { ComplaintPriorityBadge } from "@/components/citizen/complaints/ComplaintPriorityBadge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, MapPin, Tag, FileText, Inbox } from "lucide-react";
import type {
  ComplaintStatus,
  ComplaintPriority,
} from "@/lib/types/complaints";

interface Complaint {
  id: string;
  tracking_code: string;
  title: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  submitted_at: string;
  category?: { name: string } | null;
}

interface CitizenRecentComplaintsProps {
  complaints: Complaint[];
}

export function CitizenRecentComplaints({
  complaints,
}: CitizenRecentComplaintsProps) {
  // Calculate time ago helper
  const getTimeAgo = (date: string) => {
    const now = new Date();
    const submitted = new Date(date);
    const diffInHours = Math.floor(
      (now.getTime() - submitted.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
  };

  return (
    <Card className="border-white/40 bg-white/60 backdrop-blur-sm shadow-lg overflow-hidden">
      <CardHeader className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-blue-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Recent Complaints</CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Your latest submissions and updates
              </p>
            </div>
          </div>
          <Link href="/citizen/complaints">
            <Button
              variant="outline"
              size="sm"
              className="group hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {complaints.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {complaints.map((complaint, index) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                timeAgo={getTimeAgo(complaint.submitted_at)}
                index={index}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ComplaintCard({
  complaint,
  timeAgo,
  index,
}: {
  complaint: Complaint;
  timeAgo: string;
  index: number;
}) {
  return (
    <Link
      href={`/citizen/complaints/${complaint.id}`}
      className="block group"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative glass rounded-xl p-4 border border-slate-200/50 hover:border-blue-300/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden">
        {/* Status indicator bar */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${getStatusGradient(complaint.status)} transition-all duration-300 group-hover:w-2`}
        ></div>

        <div className="pl-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <code className="px-2 py-1 text-xs font-bold bg-blue-100 text-blue-700 rounded-md font-mono group-hover:bg-blue-200 transition-colors">
                  {complaint.tracking_code}
                </code>
                <ComplaintStatusBadge status={complaint.status} size="sm" />
                <ComplaintPriorityBadge
                  priority={complaint.priority}
                  size="sm"
                />
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                {complaint.title}
              </h3>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            {complaint.category?.name && (
              <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-medium">{complaint.category.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{timeAgo}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {new Date(complaint.submitted_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 mb-4 animate-float">
        <Inbox className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        No complaints yet
      </h3>
      <p className="text-sm text-slate-600 max-w-sm mx-auto mb-6">
        You haven't submitted any complaints. Start by reporting an issue in
        your area.
      </p>
      <Link href="/citizen/complaints/new">
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
          Submit Your First Complaint
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </div>
  );
}

function getStatusGradient(status: ComplaintStatus): string {
  const gradients: Record<ComplaintStatus, string> = {
    draft: "from-gray-400 to-gray-600",
    submitted: "from-blue-400 to-blue-600",
    received: "from-purple-400 to-purple-600",
    assigned: "from-yellow-400 to-yellow-600",
    in_progress: "from-orange-400 to-orange-600",
    resolved: "from-green-400 to-green-600",
    closed: "from-gray-400 to-gray-600",
    rejected: "from-red-400 to-red-600",
    escalated: "from-pink-400 to-pink-600",
  };
  return gradients[status] || gradients.draft;
}
