"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "lucide-react";

export function CurrentTime() {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
      <div className="p-1.5 bg-muted rounded-lg border border-border shadow-sm">
        <Calendar className="w-4 h-4 text-primary" />
      </div>
      {mounted ? format(time, "EEEE, MMMM d, yyyy · HH:mm:ss") : null}
    </span>
  );
}