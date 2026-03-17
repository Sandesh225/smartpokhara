"use client"

import { NotificationsView } from "@/components/shared";

export default function StaffNotificationsPage() {
  return (
    <NotificationsView 
      title="Notifications"
      description="Stay updated on your municipal tasks and assignments."
      emptyStateTitle="Inbox Zero"
      emptyStateDescription="You're all caught up! No recent alerts found."
    />
  );
}
