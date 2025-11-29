"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

const pathNameMap: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  complaints: "Complaints",
  map: "Map View",
  rules: "Assignment Rules",
  sla: "SLA Monitor",
  tasks: "Tasks",
  mine: "My Tasks",
  new: "New",
  templates: "Templates",
  cms: "CMS Pages",
  notices: "Notices",
  media: "Media Library",
  messaging: "Messaging",
  sms: "SMS Broadcasts",
  email: "Email Campaigns",
  logs: "Delivery Logs",
  payments: "Payments",
  pending: "Pending Bills",
  wallets: "Wallets",
  refunds: "Refunds",
  approvals: "Approvals",
  reconciliation: "Reconciliation",
  users: "Users",
  citizens: "Citizens",
  staff: "Staff",
  performance: "Performance",
  bulk: "Bulk Actions",
  organization: "Organization",
  departments: "Departments",
  wards: "Wards",
  gis: "GIS Configuration",
  chart: "Org Chart",
  analytics: "Analytics",
  finance: "Financial Analytics",
  website: "Website Analytics",
  custom: "Custom Reports",
  scheduled: "Scheduled Reports",
  settings: "Settings",
  categories: "Categories",
  notifications: "Notification Templates",
  integrations: "Integrations",
  security: "Security",
  maintenance: "Maintenance",
  audit: "Audit Logs",
  quality: "Quality Assurance",
  data: "Data Quality",
  duplicates: "Duplicate Detection",
  feedback: "Citizen Feedback",
  "command-center": "Command Center",
};

export function Breadcrumbs() {
  const pathname = usePathname();

  // Don't show on dashboard
  if (pathname === "/admin/dashboard" || pathname === "/admin") {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);

  // Remove 'admin' and any UUIDs
  const breadcrumbs = segments
    .filter((segment) => segment !== "admin")
    .filter(
      (segment) =>
        !segment.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        )
    );

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav className="breadcrumbs">
      <div className="breadcrumb-item">
        <Link href="/admin/dashboard" className="breadcrumb-link">
          <Home className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-4 w-4 breadcrumb-separator" />
      </div>

      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const href = `/admin/${breadcrumbs.slice(0, index + 1).join("/")}`;
        const label = pathNameMap[crumb] || crumb.replace(/-/g, " ");

        return (
          <div key={href} className="breadcrumb-item">
            {isLast ? (
              <span className="breadcrumb-current capitalize">{label}</span>
            ) : (
              <>
                <Link href={href} className="breadcrumb-link capitalize">
                  {label}
                </Link>
                <ChevronRight className="h-4 w-4 breadcrumb-separator" />
              </>
            )}
          </div>
        );
      })}
    </nav>
  );
}
