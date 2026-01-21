// ═══════════════════════════════════════════════════════════
// INPUT COMPONENT - Enhanced with Responsive Design
// ═══════════════════════════════════════════════════════════

"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  [
    "w-full min-w-0",
    "rounded-xl px-3 py-2 md:px-4",
    "border transition-all duration-200 outline-none",
    "placeholder:text-muted-foreground",
    "selection:bg-primary/20 selection:text-foreground",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    "focus:ring-2 focus:ring-primary/20 focus:border-primary",
    "aria-[invalid=true]:border-error-red aria-[invalid=true]:ring-error-red/20",
  ],
  {
    variants: {
      variant: {
        default: "bg-background border-border shadow-sm",

        stone: "stone-card border-border elevation-1",

        glass: "glass border-border/50 text-foreground backdrop-blur-md",

        filled:
          "bg-muted border-transparent hover:bg-muted/80 focus:bg-background focus:border-border",

        outline:
          "bg-transparent border-2 border-border hover:border-primary/50",
      },

      size: {
        sm: "h-8 text-xs md:text-sm",
        md: "h-9 md:h-10 text-sm md:text-base",
        lg: "h-11 md:h-12 text-base md:text-lg",
      },

      state: {
        default: "",
        error: "border-error-red ring-2 ring-error-red/20",
        success: "border-success-green ring-2 ring-success-green/20",
        warning: "border-warning-amber ring-2 ring-warning-amber/20",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "md",
      state: "default",
    },
  }
);

export interface InputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  helperText?: string;
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      state,
      type = "text",
      leftIcon,
      rightIcon,
      error,
      helperText,
      label,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    const hasError = !!error;

    const InputElement = (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            inputVariants({
              variant,
              size,
              state: hasError ? "error" : state,
            }),
            leftIcon && "pl-9 md:pl-10",
            rightIcon && "pr-9 md:pr-10",
            className
          )}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? errorId : helperText ? helperId : undefined
          }
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
    );

    if (!label && !error && !helperText) {
      return InputElement;
    }

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground block"
          >
            {label}
            {props.required && <span className="text-error-red ml-1">*</span>}
          </label>
        )}

        {InputElement}

        {error && (
          <p id={errorId} className="text-xs text-error-red font-medium">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={helperId} className="text-xs text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, inputVariants };
