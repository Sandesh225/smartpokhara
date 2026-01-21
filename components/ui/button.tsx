// ═══════════════════════════════════════════════════════════
// BUTTON COMPONENT - Enhanced Responsive Version
// ═══════════════════════════════════════════════════════════

"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from  "./LoadingSpinner";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-xl font-bold transition-all duration-200",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "active:scale-[0.97]",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:bg-primary/90",

        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:shadow-md hover:bg-secondary/85",

        destructive:
          "bg-error-red text-white shadow-md hover:bg-error-red/90 focus-visible:ring-error-red",

        success:
          "bg-success-green text-white shadow-md hover:bg-success-green/90 focus-visible:ring-success-green",

        warning:
          "bg-warning-amber text-white shadow-md hover:bg-warning-amber/90 focus-visible:ring-warning-amber",

        outline:
          "border-2 border-border bg-background text-foreground hover:bg-muted hover:border-primary/50",

        ghost: "bg-transparent text-foreground hover:bg-muted",

        link: "text-primary underline-offset-4 hover:underline",

        stone: "stone-card text-foreground hover:shadow-lg",

        glass: "glass text-foreground hover:backdrop-blur-xl shadow-lg",
      },

      size: {
        xs: "h-7 px-2.5 text-xs gap-1 [&_svg]:size-3",
        sm: "h-8 md:h-9 px-3 md:px-4 text-xs md:text-sm gap-1.5 [&_svg]:size-3.5 md:[&_svg]:size-4",
        default:
          "h-9 md:h-11 px-4 md:px-6 text-sm md:text-base gap-2 [&_svg]:size-4 md:[&_svg]:size-5",
        lg: "h-11 md:h-12 px-6 md:px-8 text-base md:text-lg gap-2 [&_svg]:size-5 md:[&_svg]:size-6",
        xl: "h-12 md:h-14 px-8 md:px-10 text-lg md:text-xl gap-2.5 [&_svg]:size-6 md:[&_svg]:size-7",
        icon: "size-9 md:size-11 p-0",
        "icon-sm": "size-8 md:size-9 p-0",
        "icon-lg": "size-11 md:size-12 p-0",
      },

      fullWidth: {
        true: "w-full",
        false: "",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      disabled,
      children,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    // When asChild is true, we can't modify children, so ignore icons and loading
    if (asChild) {
      return (
        <Comp
          ref={ref}
          className={cn(
            buttonVariants({ variant, size, fullWidth, className })
          )}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        {...props}
      >
        {loading && (
          <LoadingSpinner
            size={
              size === "xs"
                ? "xs"
                : size === "sm"
                  ? "sm"
                  : size === "lg" || size === "xl"
                    ? "md"
                    : "sm"
            }
            variant="spinner"
          />
        )}
        {!loading && leftIcon && leftIcon}
        {children}
        {!loading && rightIcon && rightIcon}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
