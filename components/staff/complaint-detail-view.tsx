"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusBadge, PriorityBadge, OverdueBadge } from "@/components/shared/status-badge"
import { DetailSkeleton } from "@/components/shared/loading-skeleton"
import { ErrorState } from "@/components/shared/empty-state"
import { AcceptModal, RejectModal, UpdateProgressModal, ResolveModal } from "@/components/staff/action-modals"
import { formatDateTime, formatRelativeTime } from "@/lib/utils/format"
import type { ComplaintDetail } from "@/lib/types/complaints"
import {
  ArrowLeft,
  MapPin,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  CheckSquare,
  FileText,
  MessageSquare,
  Star,
  Paperclip,
  Building2,
  Tag,
} from "lucide-react"

interface ComplaintDetailViewProps {
  complaint: ComplaintDetail | null
  loading: boolean
  error: Error | null
  onAccept?: (notes?: string) => Promise<void>
  onReject?: (reason: string) => Promise<void>
  onUpdateProgress?: (note: string) => Promise<void>
  onResolve?: (resolutionNotes: string) => Promise<void>
  actionLoading?: boolean
  backUrl?: string
}

export function ComplaintDetailView({
  complaint,
  loading,
  error,
  onAccept,
  onReject,
  onUpdateProgress,
  onResolve,
  actionLoading = false,
  backUrl = "/staff-app/queue/my-tasks",
}: ComplaintDetailViewProps) {
  const router = useRouter()
  const [acceptModalOpen, setAcceptModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [progressModalOpen, setProgressModalOpen] = useState(false)
  const [resolveModalOpen, setResolveModalOpen] = useState(false)

  if (loading) {
    return <DetailSkeleton />
  }

  if (error || !complaint) {
    return <ErrorState message={error?.message || "Complaint not found"} onRetry={() => router.refresh()} />
  }

  const { complaint: data, status_history, attachments, internal_comments, feedback } = complaint

  const canAccept = data.status === "assigned" && onAccept
  const canReject = data.status === "assigned" && onReject
  const canUpdateProgress = data.status === "in_progress" && onUpdateProgress
  const canResolve = data.status === "in_progress" && onResolve

  const handleAcceptConfirm = async (notes?: string) => {
    if (onAccept) {
      await onAccept(notes)
      setAcceptModalOpen(false)
    }
  }

  const handleRejectConfirm = async (reason: string) => {
    if (onReject) {
      await onReject(reason)
      setRejectModalOpen(false)
    }
  }

  const handleProgressConfirm = async (note: string) => {
    if (onUpdateProgress) {
      await onUpdateProgress(note)
      setProgressModalOpen(false)
    }
  }

  const handleResolveConfirm = async (resolutionNotes: string) => {
    if (onResolve) {
      await onResolve(resolutionNotes)
      setResolveModalOpen(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(backUrl)} className="mt-1 shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold font-mono">{data.tracking_code}</h1>
            <StatusBadge status={data.status} />
            <PriorityBadge priority={data.priority} />
            <OverdueBadge isOverdue={data.is_escalated} slaDueAt={data.sla_due_at} />
          </div>
          <h2 className="text-lg text-muted-foreground mt-1 truncate">{data.title}</h2>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{data.description}</p>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-muted shrink-0">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {data.ward_name ? `${data.ward_name} (Ward ${data.ward_number})` : "Not specified"}
                    </p>
                    {data.address_text && <p className="text-sm text-muted-foreground">{data.address_text}</p>}
                    {data.landmark && <p className="text-xs text-muted-foreground mt-0.5">Near: {data.landmark}</p>}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-muted shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Citizen</p>
                    <p className="text-sm text-muted-foreground">{data.citizen_name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-muted shrink-0">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Category</p>
                    <p className="text-sm text-muted-foreground">{data.category_name}</p>
                    {data.subcategory_name && <p className="text-xs text-muted-foreground">{data.subcategory_name}</p>}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-muted shrink-0">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Department</p>
                    <p className="text-sm text-muted-foreground">{data.department_name || "Not assigned"}</p>
                    {data.assigned_staff_name && (
                      <p className="text-xs text-muted-foreground">Assigned to: {data.assigned_staff_name}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-muted shrink-0">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Submitted</p>
                    <p className="text-sm text-muted-foreground">{formatDateTime(data.submitted_at)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-muted shrink-0">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">SLA Due</p>
                    <p className="text-sm text-muted-foreground">
                      {data.sla_due_at ? formatDateTime(data.sla_due_at) : "Not set"}
                    </p>
                  </div>
                </div>
              </div>

              {data.resolution_notes && (
                <>
                  <Separator />
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Resolution Notes
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-400 whitespace-pre-wrap">
                      {data.resolution_notes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Work Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Work Logs & Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {internal_comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No work logs yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {internal_comments.map((comment, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{comment.user_name}</span>
                          {comment.is_work_log && (
                            <Badge variant="outline" className="text-xs">
                              Work Log
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm mt-1 text-muted-foreground">{comment.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attachments */}
          {attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Attachments ({attachments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2">
                  {attachments.map((attachment, idx) => (
                    <a
                      key={idx}
                      href={attachment.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-md border hover:bg-muted/50 transition-colors"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm truncate flex-1">{attachment.file_name}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feedback */}
          {feedback && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Citizen Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < feedback.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">{feedback.rating} out of 5</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={feedback.is_satisfied ? "default" : "destructive"}>
                    {feedback.is_satisfied ? "Satisfied" : "Not Satisfied"}
                  </Badge>
                  <Badge variant={feedback.is_resolved ? "default" : "secondary"}>
                    {feedback.is_resolved ? "Issue Resolved" : "Issue Not Resolved"}
                  </Badge>
                  {feedback.would_recommend !== null && (
                    <Badge variant="outline">
                      {feedback.would_recommend ? "Would Recommend" : "Would Not Recommend"}
                    </Badge>
                  )}
                </div>
                {feedback.feedback_text && <p className="text-sm bg-muted p-3 rounded-md">{feedback.feedback_text}</p>}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          {(canAccept || canReject || canUpdateProgress || canResolve) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {canAccept && (
                  <Button className="w-full" onClick={() => setAcceptModalOpen(true)} disabled={actionLoading}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Task
                  </Button>
                )}
                {canReject && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setRejectModalOpen(true)}
                    disabled={actionLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Task
                  </Button>
                )}
                {canUpdateProgress && (
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => setProgressModalOpen(true)}
                    disabled={actionLoading}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Update Progress
                  </Button>
                )}
                {canResolve && (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => setResolveModalOpen(true)}
                    disabled={actionLoading}
                  >
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Mark Resolved
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {status_history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No status changes yet</p>
              ) : (
                <div className="relative pl-6 space-y-4">
                  <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
                  {status_history.map((entry, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-4 w-2 h-2 rounded-full bg-primary ring-4 ring-background" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusBadge status={entry.new_status} />
                          <span className="text-xs text-muted-foreground">{formatRelativeTime(entry.changed_at)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">by {entry.changed_by}</p>
                        {entry.note && <p className="text-xs mt-1 text-muted-foreground italic">"{entry.note}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Source</span>
                <Badge variant="outline" className="capitalize">
                  {data.source.replace("_", " ")}
                </Badge>
              </div>
              {data.assigned_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Assigned</span>
                  <span>{formatRelativeTime(data.assigned_at)}</span>
                </div>
              )}
              {data.in_progress_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Started</span>
                  <span>{formatRelativeTime(data.in_progress_at)}</span>
                </div>
              )}
              {data.resolved_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Resolved</span>
                  <span>{formatRelativeTime(data.resolved_at)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <AcceptModal
        open={acceptModalOpen}
        onOpenChange={setAcceptModalOpen}
        onConfirm={handleAcceptConfirm}
        loading={actionLoading}
        trackingCode={data.tracking_code}
      />

      <RejectModal
        open={rejectModalOpen}
        onOpenChange={setRejectModalOpen}
        onConfirm={handleRejectConfirm}
        loading={actionLoading}
        trackingCode={data.tracking_code}
      />

      <UpdateProgressModal
        open={progressModalOpen}
        onOpenChange={setProgressModalOpen}
        onConfirm={handleProgressConfirm}
        loading={actionLoading}
        trackingCode={data.tracking_code}
      />

      <ResolveModal
        open={resolveModalOpen}
        onOpenChange={setResolveModalOpen}
        onConfirm={handleResolveConfirm}
        loading={actionLoading}
        trackingCode={data.tracking_code}
      />
    </div>
  )
}
