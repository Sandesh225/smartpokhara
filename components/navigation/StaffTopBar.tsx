"use client";

import * as React from "react";

type StaffUser = {
  name?: string | null;
  role?: string | null;
};

type StaffTopBarProps = {
  user?: StaffUser;
};

const StaffTopBar: React.FC<StaffTopBarProps> = ({ user }) => {
  const displayName = user?.name || "Staff User";
  const role = user?.role || "Staff";

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4 md:px-6">
      {/* Left: app/section title */}
      <div className="flex flex-col">
        <span className="text-sm font-semibold">Staff Dashboard</span>
        <span className="text-xs text-muted-foreground">
          Logged in as {role}
        </span>
      </div>

      {/* Right: user name */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold uppercase">
          {displayName
            .split(" ")
            .map((p) => p[0])
            .join("")
            .slice(0, 2)}
        </div>
        <div className="flex flex-col text-right">
          <span className="text-xs font-medium">{displayName}</span>
          <span className="text-[11px] text-muted-foreground">{role}</span>
        </div>
      </div>
    </header>
  );
};

export default StaffTopBar;
