"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Breadcrumb = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) => (
  <nav
    aria-label="breadcrumb"
    className={cn(
      "flex items-center text-sm text-muted-foreground",
      className
    )}
    {...props}
  />
);
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = ({
  className,
  ...props
}: React.HTMLAttributes<ol>) => (
  <ol className={cn("flex items-center gap-1", className)} {...props} />
);
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = ({
  className,
  ...props
}: React.LiHTMLAttributes<HTMLLIElement>) => (
  <li className={cn("inline-flex items-center", className)} {...props} />
);
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, ...props }, ref) => (
  <a
    ref={ref}
    className={cn("hover:text-foreground transition-colors", className)}
    {...props}
  />
));
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbPage = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    aria-current="page"
    className={cn("font-medium text-foreground", className)}
    {...props}
  />
);
BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbSeparator = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    role="presentation"
    className={cn(
      "flex items-center px-1 text-muted-foreground",
      className
    )}
    {...props}
  >
    <ChevronRight className="h-4 w-4" />
  </span>
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
};
