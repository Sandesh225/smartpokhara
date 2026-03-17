"use client"

import { NotificationsView } from "@/components/shared";

export default function SupervisorNotificationsPage() {
  return (
    <NotificationsView 
      title="Notifications"
      description="Stay updated on escalations and team activities"
      emptyStateTitle="No notifications"
      emptyStateDescription="You're all caught up! Check back later."
    />
  );
}
