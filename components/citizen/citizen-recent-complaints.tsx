/**
 * UPDATED: Recent complaints component
 * Uses canonical badges and proper types
 */

"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComplaintStatusBadge } from "@/components/citizen/complaints/ComplaintStatusBadge";
import { ComplaintPriorityBadge } from "@/components/citizen/complaints/ComplaintPriorityBadge";
import { Button } from "@/components/ui/button";

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
  return (
    <Card className="border-slate-200">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Your Recent Complaints</CardTitle>
        <Link href="/citizen/complaints">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {complaints.length === 0 ? (
            <p className="py-8 text-center text-slate-500">
              No complaints submitted yet
            </p>
          ) : (
            complaints.map((complaint) => (
              <Link
                key={complaint.id}
                href={`/citizen/complaints/${complaint.id}`}
                className="block rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm font-semibold text-blue-600">
                        {complaint.tracking_code}
                      </p>
                      <ComplaintStatusBadge
                        status={complaint.status}
                        size="sm"
                      />
                      <ComplaintPriorityBadge
                        priority={complaint.priority}
                        size="sm"
                      />
                    </div>
                    <p className="mt-1 truncate font-medium text-slate-900">
                      {complaint.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(complaint.submitted_at).toLocaleDateString()} •{" "}
                      {complaint.category?.name}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
