// ui//pagination.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export function Pagination(
  props: React.HTMLAttributes<HTMLElement>
) {
  return (
    <nav
      aria-label="pagination"
      className={cn("flex justify-center", props.className)}
      {...props}
    />
  );
}

export function PaginationContent(
  props: React.HTMLAttributes<HTMLUListElement>
) {
  return (
    <ul
      className={cn("flex items-center gap-1", props.className)}
      {...props}
    />
  );
}

export function PaginationItem(
  props: React.LiHTMLAttributes<HTMLLIElement>
) {
  return (
    <li
      className={cn("inline-flex", props.className)}
      {...props}
    />
  );
}

interface PaginationLinkProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

export const PaginationLink = React.forwardRef<
  HTMLButtonElement,
  PaginationLinkProps
>(({ className, isActive, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-md border px-3 text-sm transition-colors",
        "border-input bg-background hover:bg-accent hover:text-accent-foreground",
        isActive && "border-primary bg-primary text-primary-foreground",
        className
      )}
      {...props}
    />
  );
});
PaginationLink.displayName = "PaginationLink";

type PaginationNavProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const PaginationPrevious = React.forwardRef<
  HTMLButtonElement,
  PaginationNavProps
>(({ className, children = "Previous", ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm",
      "border-input bg-background hover:bg-accent hover:text-accent-foreground",
      className
    )}
    {...props}
  >
    {children}
  </button>
));
PaginationPrevious.displayName = "PaginationPrevious";

export const PaginationNext = React.forwardRef<
  HTMLButtonElement,
  PaginationNavProps
>(({ className, children = "Next", ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm",
      "border-input bg-background hover:bg-accent hover:text-accent-foreground",
      className
    )}
    {...props}
  >
    {children}
  </button>
));
PaginationNext.displayName = "PaginationNext";
