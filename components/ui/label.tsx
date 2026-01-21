// ═══════════════════════════════════════════════════════════
// components/ui/label.tsx - ENHANCED LABEL COMPONENT
// ═══════════════════════════════════════════════════════════

"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const labelVariants = cva(
  [
    "leading-none",
    "font-medium",
    "select-none",
    "peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
    "transition-colors duration-200",
  ],
  {
    variants: {
      variant: {
        default: "text-foreground text-sm",
        stone: "text-foreground text-sm font-bold",
        muted: "text-muted-foreground text-xs font-medium",
        required: "text-foreground text-sm font-bold",
      },
      size: {
        xs: "text-xs",
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
      required: {
        true: "after:content-['*'] after:ml-0.5 after:text-error-red after:font-bold",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
      required: false,
    },
  }
);

export interface LabelProps
  extends
    React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {
  required?: boolean;
  error?: boolean;
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, variant, size, required, error, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    data-slot="label"
    className={cn(
      labelVariants({ variant, size, required }),
      error && "text-error-red",
      className
    )}
    {...props}
  />
));

Label.displayName = LabelPrimitive.Root.displayName;

export { Label, labelVariants };
