export default function ServicesLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Header skeleton */}
        <header className="space-y-6">
          <div>
            <div className="h-7 w-32 rounded-full bg-muted mb-4" />
            <div className="h-10 w-64 rounded-xl bg-muted" />
            <div className="h-5 w-96 rounded-lg bg-muted mt-3" />
          </div>
          <div className="flex gap-4">
            <div className="h-11 w-80 rounded-xl bg-muted" />
            <div className="h-8 w-24 rounded-lg bg-muted" />
          </div>
        </header>

        {/* Category skeletons */}
        {[1, 2, 3].map((i) => (
          <section key={i} className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted" />
              <div className="space-y-2">
                <div className="h-5 w-48 rounded-lg bg-muted" />
                <div className="h-4 w-72 rounded-lg bg-muted" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-28 rounded-xl bg-muted border border-border" />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
