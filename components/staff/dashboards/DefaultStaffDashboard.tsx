// components/staff/dashboards/DefaultStaffDashboard.tsx
"use client";

import Link from "next/link";
import type { CurrentUser } from "@/lib/types/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, HelpCircle, FileText } from "lucide-react";

interface DefaultStaffDashboardProps {
  user: CurrentUser;
}

export function DefaultStaffDashboard({ user }: DefaultStaffDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-gray-900">
          <LayoutDashboard className="h-6 w-6 text-blue-600" />
          Staff Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome to the Smart City Pokhara staff portal.
        </p>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <p>
            Your account is active, but we couldn&apos;t match you to a specific staff
            dashboard (ward staff, department staff, field staff, supervisor, or helpdesk).
          </p>
          <p>
            If you believe this is a mistake, please contact your system administrator so
            they can assign you the correct role.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/staff/profile">
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                View Profile
              </Button>
            </Link>
            <Link href="/support">
              <Button variant="outline" size="sm">
                <HelpCircle className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
