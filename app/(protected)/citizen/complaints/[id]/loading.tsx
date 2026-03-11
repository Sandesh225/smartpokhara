export default function ComplaintDetailLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Nav bar skeleton */}
      <div className="h-14 bg-card border-b border-border" />

      {/* Hero skeleton */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-7 space-y-5">
          <div className="flex gap-2">
            <div className="h-6 w-28 rounded-full bg-muted" />
            <div className="h-6 w-24 rounded-full bg-muted" />
          </div>
          <div className="h-8 w-2/3 rounded-xl bg-muted" />
          <div className="flex gap-3">
            <div className="h-6 w-32 rounded-lg bg-muted" />
            <div className="h-6 w-40 rounded-lg bg-muted" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-muted border border-border" />
            ))}
          </div>
        </div>
      </div>

      {/* Body skeleton */}
      <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-5">
          <div className="h-10 w-72 rounded-xl bg-muted" />
          <div className="h-40 rounded-xl bg-muted border border-border" />
          <div className="h-56 rounded-xl bg-muted border border-border" />
        </div>
        <div className="space-y-4">
          <div className="h-36 rounded-xl bg-muted border border-border" />
          <div className="h-48 rounded-xl bg-muted border border-border" />
        </div>
      </div>
    </div>
  );
}
