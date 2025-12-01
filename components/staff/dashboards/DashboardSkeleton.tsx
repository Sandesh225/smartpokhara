// components/staff/dashboards/DashboardSkeleton.tsx
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="border-b border-gray-200 pb-5">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="mt-2 h-4 w-96 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="mt-2 h-8 w-12 bg-gray-200 rounded animate-pulse" />
            <div className="mt-1 h-3 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="bg-white rounded-lg border p-6">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 border rounded-lg mb-4">
            <div className="flex-1">
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-48 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}