"use client"

import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"/ui/
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/ui/dropdown/ui/nu"
import { StatusBadge, PriorityBadge, OverdueBadge } from "@/components/shared/status-badge"
import { NoTasksState } from "@/components/shared/empty-state"
import { TableSkeleton } from "@/components/shared/loading-skeleton"
import { formatRelativeTime } from "@/lib/utils/format"
import type { Complaint } from "@/lib/types/complaints"
import { MoreHorizontal, Eye, CheckCircle, XCircle, Play, CheckSquare } from "lucide-react"

interface ComplaintTableProps {
  complaints: Complaint[]
  loading: boolean
  onAccept?: (id: string) => void
  onReject?: (id: string) => void
  onUpdateProgress?: (id: string) => void
  onResolve?: (id: string) => void
  currentUserId?: string
  showAssignment?: boolean
  baseUrl?: string
}

export function ComplaintTable({
  complaints,
  loading,
  onAccept,
  onReject,
  onUpdateProgress,
  onResolve,
  currentUserId,
  showAssignment = false,
  baseUrl = "/staff-app/complaints",
}: ComplaintTableProps) {
  const router = useRouter()

  if (loading) {
    return <TableSkeleton rows={5} />
  }

  if (complaints.length === 0) {
    return <NoTasksState />
  }

  const canAccept = (complaint: Complaint) => complaint.status === "assigned" && onAccept

  const canReject = (complaint: Complaint) => complaint.status === "assigned" && onReject

  const canUpdateProgress = (complaint: Complaint) => complaint.status === "in_progress" && onUpdateProgress

  const canResolve = (complaint: Complaint) => complaint.status === "in_progress" && onResolve

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-28">Tracking #</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-24">Ward</TableHead>
            <TableHead className="w-32">Category</TableHead>
            <TableHead className="w-28">Status</TableHead>
            <TableHead className="w-24">Priority</TableHead>
            <TableHead className="w-28">SLA</TableHead>
            <TableHead className="w-32">Submitted</TableHead>
            {showAssignment && <TableHead className="w-32">Assigned To</TableHead>}
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {complaints.map((complaint) => (
            <TableRow
              key={complaint.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`${baseUrl}/${complaint.id}`)}
            >
              <TableCell className="font-mono text-sm">{complaint.tracking_code}</TableCell>
              <TableCell className="font-medium max-w-xs truncate">{complaint.title}</TableCell>
              <TableCell>{complaint.ward_number ? `Ward ${complaint.ward_number}` : "-"}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{complaint.category_name}</TableCell>
              <TableCell>
                <StatusBadge status={complaint.status} />
              </TableCell>
              <TableCell>
                <PriorityBadge priority={complaint.priority} />
              </TableCell>
              <TableCell>
                <OverdueBadge isOverdue={complaint.is_overdue} slaDueAt={complaint.sla_due_at} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatRelativeTime(complaint.submitted_at)}
              </TableCell>
              {showAssignment && <TableCell className="text-sm">{complaint.assigned_staff_name || "-"}</TableCell>}
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`${baseUrl}/${complaint.id}`)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    {(canAccept(complaint) ||
                      canReject(complaint) ||
                      canUpdateProgress(complaint) ||
                      canResolve(complaint)) && <DropdownMenuSeparator />}
                    {canAccept(complaint) && (
                      <DropdownMenuItem onClick={() => onAccept?.(complaint.id)} className="text-green-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept
                      </DropdownMenuItem>
                    )}
                    {canReject(complaint) && (
                      <DropdownMenuItem onClick={() => onReject?.(complaint.id)} className="text-red-600">
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </DropdownMenuItem>
                    )}
                    {canUpdateProgress(complaint) && (
                      <DropdownMenuItem onClick={() => onUpdateProgress?.(complaint.id)}>
                        <Play className="h-4 w-4 mr-2" />
                        Update Progress
                      </DropdownMenuItem>
                    )}
                    {canResolve(complaint) && (
                      <DropdownMenuItem onClick={() => onResolve?.(complaint.id)} className="text-green-600">
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Mark Resolved
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
