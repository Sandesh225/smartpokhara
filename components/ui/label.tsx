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
  ],
  {
    variants: {
      variant: {
        default: "text-foreground text-sm",
        stone: "text-slate-800 text-sm",
        muted: "text-muted-foreground text-xs",
      },
      required: {
        true: "after:content-['*'] after:ml-0.5 after:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, variant, required, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    data-slot="label"
    className={cn(labelVariants({ variant, required }), className)}
    {...props}
  />
));

Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
