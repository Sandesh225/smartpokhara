export default function BudgetingLoading() {
  return (
    <main className="w-full flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 sm:space-y-8 animate-pulse">
      {/* Header skeleton */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 pb-6 border-b border-border">
        <div className="space-y-3">
          <div className="h-7 w-32 rounded-full bg-muted" />
          <div className="h-10 w-80 rounded-xl bg-muted" />
          <div className="h-5 w-96 rounded-lg bg-muted" />
        </div>
      </header>

      {/* Content skeleton */}
      <div className="space-y-6">
        <div className="h-12 w-64 rounded-xl bg-muted" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-muted border border-border" />
          ))}
        </div>
      </div>
    </main>
  );
}
