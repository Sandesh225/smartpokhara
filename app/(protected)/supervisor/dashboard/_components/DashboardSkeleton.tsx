// @/components/supervisor/dashboard/DashboardSkeleton.tsx
export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Metrics Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 bg-gray-200 rounded-lg" />
              <div className="h-4 w-16 bg-gray-200 rounded" />
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-32 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="h-5 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-full bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
            <div className="h-64 bg-gray-100 rounded-lg" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
            <div className="h-48 bg-gray-100 rounded-lg" />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="h-6 w-28 bg-gray-200 rounded mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}