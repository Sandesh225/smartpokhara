'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, indicatorClassName, ...props }, ref) => {
    const clamped = Math.min(Math.max(value, 0), 100);

    return (
      <div
        ref={ref}
        className={cn(
          'w-full h-2 bg-gray-200 rounded-full overflow-hidden',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full bg-primary transition-all',
            indicatorClassName // Applied here, not on the parent
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };