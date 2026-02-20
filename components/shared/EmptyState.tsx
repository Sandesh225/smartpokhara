import Link from "next/link";
import { FileSearch, type LucideIcon, Plus, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  message?: string;
  description?: string; // Compatibility with staff version
  icon?: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
  action?: React.ReactNode; // Compatibility with staff version
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title = "No data found",
  message,
  description,
  icon: Icon = FileSearch,
  actionLabel,
  actionHref,
  action,
  onAction,
  className,
}: EmptyStateProps) {
  const displayMessage = message || description || "We couldn't find anything matching your criteria.";
  
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted bg-muted/30 py-16 px-4 text-center",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-background shadow-sm ring-1 ring-border mb-4">
        <Icon className="h-8 w-8 text-muted-foreground/60" />
      </div>

      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto font-medium">{displayMessage}</p>

      <div className="mt-8">
        {action ? (
          action
        ) : actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-black text-white shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all"
          >
            <Plus className="h-4 w-4" />
            {actionLabel}
          </Link>
        ) : onAction && actionLabel ? (
          <button
            onClick={onAction}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-black text-white shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all"
          >
            <Plus className="h-4 w-4" />
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
