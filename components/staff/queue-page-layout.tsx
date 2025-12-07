"use client";

import { useStaffQueue } from "@/lib/hooks/use-complaints";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Loader2, Calendar, MapPin, Inbox } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ComplaintActions from "@/components/supervisor/ComplaintActions"; // Reuse assignment modal if needed

interface Props {
  queueType: "my_tasks" | "team_queue";
  title: string;
  description: string;
  showAssignment?: boolean;
}

export function QueuePageLayout({
  queueType,
  title,
  description,
  showAssignment,
}: Props) {
  const { complaints, loading } = useStaffQueue(queueType);

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "critical":
        return "destructive";
      case "urgent":
        return "destructive";
      case "high":
        return "secondary"; // orange-ish usually
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1 text-sm">
            {complaints.length} Items
          </Badge>
        </div>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600" />
              <p>Loading queue...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-20 flex flex-col items-center justify-center text-gray-500 bg-gray-50/50">
              <Inbox className="h-12 w-12 mb-4 text-gray-300" />
              <h3 className="font-semibold text-lg text-gray-900">
                Queue Empty
              </h3>
              <p>No complaints found in this list.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-[120px]">Tracking</TableHead>
                    <TableHead className="min-w-[300px]">Details</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[150px]">SLA Due</TableHead>
                    <TableHead className="w-[150px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((c) => (
                    <TableRow
                      key={c.id}
                      className="group hover:bg-blue-50/30 transition-colors"
                    >
                      <TableCell className="font-mono text-xs font-medium text-gray-600">
                        {c.tracking_code}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <span className="font-semibold text-gray-900 block group-hover:text-blue-700 transition-colors">
                            {c.title}
                          </span>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              Ward {c.ward_number}
                            </span>
                            <Badge
                              variant={getPriorityColor(c.priority) as any}
                              className="h-5 text-[10px] px-1.5 uppercase"
                            >
                              {c.priority}
                            </Badge>
                            <span>{c.category_name}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="capitalize bg-white whitespace-nowrap"
                        >
                          {c.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Calendar className="w-3.5 h-3.5" />
                          {c.sla_due_at ? (
                            <span
                              className={
                                c.is_overdue ? "text-red-600 font-medium" : ""
                              }
                            >
                              {formatDistanceToNow(new Date(c.sla_due_at), {
                                addSuffix: true,
                              })}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {showAssignment && (
                            <ComplaintActions
                              complaintId={c.id}
                              trackingCode={c.tracking_code}
                            />
                          )}
                          <Link href={`/staff/complaints/${c.id}`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
