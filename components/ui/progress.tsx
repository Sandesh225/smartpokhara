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
      "h-full transition-all duration-500 flex items-center justify-center text-xs font-semibold text-white",
      gradient && "bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400",
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
          "w-full h-3 rounded-full bg-neutral-stone-200 overflow-hidden",
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
