// ui//command.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export function Command(
  props: React.HTMLAttributes<HTMLDivElement>
) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-md border bg-background text-sm",
        props.className
      )}
      {...props}
    />
  );
}

export function CommandInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <div className="border-b px-3 py-2">
      <input
        {...props}
        className={cn(
          "h-8 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground",
          props.className
        )}
      />
    </div>
  );
}

export function CommandList(
  props: React.HTMLAttributes<HTMLDivElement>
) {
  return (
    <div
      className={cn("max-h-60 overflow-y-auto py-1", props.className)}
      {...props}
    />
  );
}

export function CommandEmpty(
  props: React.HTMLAttributes<HTMLDivElement>
) {
  return (
    <div
      className={cn(
        "px-3 py-2 text-sm text-muted-foreground",
        props.className
      )}
      {...props}
    />
  );
}

export function CommandGroup(
  props: React.HTMLAttributes<HTMLDivElement>
) {
  return (
    <div
      className={cn("px-1 py-1.5", props.className)}
      {...props}
    />
  );
}

export function CommandItem(
  props: React.HTMLAttributes<HTMLDivElement>
) {
  return (
    <div
      role="button"
      className={cn(
        "flex cursor-pointer select-none items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
        props.className
      )}
      {...props}
    />
  );
}
