"use client";

import { useMemo } from "react";

function formatHeaderDate(d: Date) {
  // Nepal time + stable locale
  const raw = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    timeZone: "Asia/Kathmandu",
  }).format(d);

  // en-GB often returns "Saturday, 13 Dec" -> you want "Saturday 13 Dec"
  return raw.replace(",", "");
}

export function DashboardHeaderGreeting({ user }: { user: any }) {
  const todayLabel = useMemo(() => formatHeaderDate(new Date()), []);

  return (
    <div className="mb-6 space-y-2">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        {todayLabel}
      </p>

      {/* rest of your greeting UI... */}
    </div>
  );
}
