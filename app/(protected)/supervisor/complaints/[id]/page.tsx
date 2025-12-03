"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { ComplaintDetailView } from "@/components/staff/complaint-detail-view"
import {
  useComplaintDetail,
  useComplaintRealtimeUpdates,
  useCurrentUser,
  useAcceptComplaint,
  useRejectComplaint,
  useUpdateProgress,
  useResolveComplaint,
} from "@/lib/hooks/use-complaints"

export default function SupervisorComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const { user, loading: userLoading } = useCurrentUser()
  const { complaint, loading, error, refetch } = useComplaintDetail(id)
  const { lastUpdate } = useComplaintRealtimeUpdates(id)

  const { acceptComplaint, loading: acceptLoading } = useAcceptComplaint()
  const { rejectComplaint, loading: rejectLoading } = useRejectComplaint()
  const { updateProgress, loading: progressLoading } = useUpdateProgress()
  const { resolveComplaint, loading: resolveLoading } = useResolveComplaint()

  const actionLoading = acceptLoading || rejectLoading || progressLoading || resolveLoading

  const handleAccept = async (notes?: string) => {
    if (!user) return
    await acceptComplaint(id, user.user_id, notes)
    refetch()
  }

  const handleReject = async (reason: string) => {
    if (!user) return
    await rejectComplaint(id, user.user_id, reason)
    refetch()
  }

  const handleUpdateProgress = async (note: string) => {
    if (!user) return
    await updateProgress(id, user.user_id, note)
    refetch()
  }

  const handleResolve = async (resolutionNotes: string) => {
    await resolveComplaint(id, resolutionNotes)
    refetch()
  }

  return (
    <ComplaintDetailView
      complaint={complaint}
      loading={loading || userLoading}
      error={error}
      onAccept={handleAccept}
      onReject={handleReject}
      onUpdateProgress={handleUpdateProgress}
      onResolve={handleResolve}
      actionLoading={actionLoading}
      backUrl="/supervisor-app/escalations"
    />
  )
}
