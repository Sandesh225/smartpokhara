import { QueuePageLayout } from "@/components/staff/QueuePageLayout";

export const dynamic = "force-dynamic";

export default function StaffTeamQueuePage() {
  return (
    <QueuePageLayout
      queueType="team_queue"
      title="Team Complaints"
      description="Complaints assigned to your department or team."
      showAssignment={true}
    />
  );
}
