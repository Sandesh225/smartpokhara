import { cn } from "@/lib/utils";

type SkeletonVariant = "dashboard" | "list" | "detail" | "grid";

interface PageSkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded-xl bg-muted animate-pulse", className)}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div className="page-container section-spacing py-8">
      {/* Header skeleton */}
      <div className="card-glass p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-4">
          <SkeletonBlock className="h-14 w-14 rounded-2xl" />
          <div className="space-y-2 flex-1">
            <SkeletonBlock className="h-8 w-64" />
            <SkeletonBlock className="h-4 w-40" />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <SkeletonBlock className="h-8 w-32 rounded-full" />
          <SkeletonBlock className="h-8 w-32 rounded-full" />
          <SkeletonBlock className="h-8 w-40 rounded-full" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stone-card p-6 space-y-4">
            <SkeletonBlock className="h-12 w-12 rounded-2xl" />
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="h-10 w-16" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 stone-card p-6 space-y-4">
          <SkeletonBlock className="h-6 w-40 mb-6" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <SkeletonBlock className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-3/4" />
                <SkeletonBlock className="h-3 w-1/2" />
              </div>
              <SkeletonBlock className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
        <div className="stone-card p-6 space-y-4">
          <SkeletonBlock className="h-6 w-32 mb-6" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="page-container section-spacing py-8">
      {/* Header */}
      <div className="card-glass p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <SkeletonBlock className="h-14 w-14 rounded-2xl" />
          <div className="space-y-2 flex-1">
            <SkeletonBlock className="h-8 w-48" />
            <SkeletonBlock className="h-4 w-64" />
          </div>
          <SkeletonBlock className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="stone-card p-6 space-y-3">
            <SkeletonBlock className="h-12 w-12 rounded-2xl" />
            <SkeletonBlock className="h-3 w-16" />
            <SkeletonBlock className="h-8 w-12" />
          </div>
        ))}
      </div>

      {/* List items */}
      <div className="stone-card divide-y divide-border">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="p-4 sm:p-6 flex items-center gap-4">
            <SkeletonBlock className="h-10 w-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <SkeletonBlock className="h-5 w-3/4" />
              <SkeletonBlock className="h-3 w-1/2" />
            </div>
            <SkeletonBlock className="h-6 w-24 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="page-container section-spacing py-8">
      {/* Back button */}
      <SkeletonBlock className="h-10 w-32 rounded-full" />

      {/* Hero */}
      <div className="rounded-2xl bg-muted p-8 sm:p-12 space-y-4">
        <SkeletonBlock className="h-6 w-24 rounded-full" />
        <SkeletonBlock className="h-12 w-3/4" />
        <div className="flex gap-4 mt-6">
          <SkeletonBlock className="h-10 w-40" />
          <SkeletonBlock className="h-10 w-40" />
        </div>
      </div>

      {/* Content */}
      <div className="stone-card p-8 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonBlock key={i} className={`h-4 ${i % 3 === 0 ? "w-full" : i % 3 === 1 ? "w-5/6" : "w-2/3"}`} />
        ))}
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="page-container section-spacing py-8">
      <div className="card-glass p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <SkeletonBlock className="h-14 w-14 rounded-2xl" />
          <div className="space-y-2 flex-1">
            <SkeletonBlock className="h-8 w-48" />
            <SkeletonBlock className="h-4 w-64" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="stone-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <SkeletonBlock className="h-10 w-10 rounded-xl" />
              <SkeletonBlock className="h-5 w-32" />
            </div>
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-2/3" />
            <div className="flex gap-2 mt-4">
              <SkeletonBlock className="h-6 w-16 rounded-full" />
              <SkeletonBlock className="h-6 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const variants: Record<SkeletonVariant, React.FC> = {
  dashboard: DashboardSkeleton,
  list: ListSkeleton,
  detail: DetailSkeleton,
  grid: GridSkeleton,
};

export function PageSkeleton({ variant = "dashboard", className }: PageSkeletonProps) {
  const Variant = variants[variant];
  return (
    <div className={cn("min-h-[60vh] animate-fade-in", className)}>
      <Variant />
    </div>
  );
}
