/**
 * Simplified dashboard card - clean design, no complexity
 * Government-style card with clear CTA and consistent spacing
 */

"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  href: string;
  badge?: string;
  badgeColor?: "red" | "yellow" | "green" | "blue";
}

export function DashboardCard({
  title,
  description,
  icon,
  href,
  badge,
  badgeColor = "red",
}: DashboardCardProps) {
  const badgeColors = {
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <Link
      href={href}
      className={cn(
        "block bg-white rounded-lg border border-gray-200 shadow-sm",
        "p-6 transition-all duration-200",
        "hover:shadow-md hover:border-blue-300",
        "focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        {icon && <div className="text-3xl">{icon}</div>}
        {badge && (
          <span
            className={cn(
              "px-2.5 py-1 text-xs font-semibold rounded-full",
              badgeColors[badgeColor]
            )}
          >
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  );
}
