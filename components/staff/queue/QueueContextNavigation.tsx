"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function QueueContextNavigation() {
  const pathname = usePathname();

  const tabs = [
    { href: "/staff/queue", label: "My Queue" },
    { href: "/staff/queue/my-tasks", label: "My Tasks Only" },
    { href: "/staff/queue/team", label: "Team Queue" },
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <div className="flex gap-6 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          // Exact match for root queue, partial match for sub-routes
          const isActive = tab.href === "/staff/queue" 
            ? pathname === "/staff/queue"
            : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}