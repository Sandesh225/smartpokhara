import { QueuePageLayout } from "@/components/staff/QueuePageLayout";

export const dynamic = "force-dynamic";

export default function StaffMyTasksPage() {
  return (
    <QueuePageLayout
      queueType="my_tasks"
      title="My Tasks"
      description="Complaints currently assigned to you."
      showAssignment={false}
    />
  );
}
