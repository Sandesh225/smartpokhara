'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // 0-100
  indicatorClassName?: string;
  striped?: boolean; // animated stripes
  gradient?: boolean; // gradient indicator
  color?: string; // Tailwind color or CSS var
  showLabel?: boolean; // show % inside bar
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value = 0,
      indicatorClassName,
      striped = false,
      gradient = false,
      color = "bg-primary",
      showLabel = false,
      ...props
    },
    ref
  ) => {
    const clamped = Math.min(Math.max(value, 0), 100);

    const indicatorClasses = cn(
      "h-full transition-all duration-500 flex items-center justify-center text-xs font-semibold text-primary-foreground",
      gradient && "bg-linear-to-r from-primary via-secondary to-accent-nature",
      striped && "bg-stripes animate-stripes",
      !gradient && !striped && color,
      indicatorClassName
    );

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(
          "w-full h-3 rounded-full bg-muted overflow-hidden border border-border/10",
          className
        )}
        {...props}
      >
        <div className={indicatorClasses} style={{ width: `${clamped}%` }}>
          {showLabel && <span>{clamped}%</span>}
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };
