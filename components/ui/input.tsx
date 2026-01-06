import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  [
    "w-full min-w-0 text-base md:text-sm",
    "rounded-xl px-4 py-2",
    "border transition-all duration-200 outline-none",
    "placeholder:text-muted-foreground",
    "selection:bg-primary selection:text-primary-foreground",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    "focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:border-ring",
    "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
  ],
  {
    variants: {
      variant: {
        default: "bg-background border-input shadow-xs",

        stone: "bg-white border-neutral-stone-200 elevation-1",

        glass: "glass border-white/30 text-foreground",
      },
      size: {
        sm: "h-9 text-sm",
        md: "h-11 text-base",
        lg: "h-12 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

function Input({
  className,
  type = "text",
  variant,
  size,
  ...props
}: React.ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Input };
