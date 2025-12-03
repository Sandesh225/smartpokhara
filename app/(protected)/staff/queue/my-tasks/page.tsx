import { QueuePageLayout } from "@/components/staff/queue-page-layout"

export default function MyTasksPage() {
  return (
    <QueuePageLayout
      queueType="my_tasks"
      title="My Tasks"
      description="Complaints assigned to you that need your attention."
    />
  )
}
