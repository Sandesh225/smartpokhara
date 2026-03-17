"use client";

import { SettingsView } from "@/components/shared";

export default function StaffSettingsPage() {
  return (
    <SettingsView
      roleBadge="Municipal Staff"
      defaultDepartment="Municipal Operations"
      authorityDescription="Your permissions are managed by the Department Head"
    />
  );
}