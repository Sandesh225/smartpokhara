import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
        
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 pb-8 border-b border-border/60">
          <div className="space-y-4">
            <div className="h-6 w-32 bg-muted rounded-full" />
            <div className="h-12 w-64 bg-muted rounded-xl" />
            <div className="flex gap-4">
              <div className="h-4 w-40 bg-muted rounded-md" />
              <div className="h-4 w-40 bg-muted rounded-md" />
            </div>
          </div>
          <div className="h-12 w-32 bg-muted rounded-xl" />
        </div>

        {/* Banner Skeleton */}
        <div className="h-16 w-full bg-muted rounded-2xl" />

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-3xl" />
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <div className="space-y-4">
          <div className="h-6 w-48 bg-muted rounded-md" />
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-2xl" />
            ))}
          </div>
        </div>

        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 h-[450px] bg-muted rounded-3xl" />
          <div className="space-y-6">
            <div className="h-[300px] bg-muted rounded-3xl" />
            <div className="h-[250px] bg-muted rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
