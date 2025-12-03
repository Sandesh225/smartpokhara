import { QueuePageLayout } from "@/components/staff/queue-page-layout"

export default function TeamQueuePage() {
  return (
    <QueuePageLayout
      queueType="team_queue"
      title="Team Queue"
      description="All complaints in your department's queue."
      showAssignment
    />
  )
}
