"use client";

import { SettingsView } from "@/components/shared";

export default function SupervisorSettingsPage() {
  return (
    <SettingsView
      roleBadge="Supervisor"
      defaultDepartment="Managerial Office"
      authorityDescription="Your permissions are managed by the System Administrators"
    />
  );
}
