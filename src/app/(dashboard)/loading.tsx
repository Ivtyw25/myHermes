function Bar({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 divide-y divide-border rounded-xl border border-border bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {[0, 1, 2].map((i) => (
          <div key={i} className="px-6 py-5">
            <Bar className="h-3 w-20" />
            <Bar className="mt-3 h-7 w-28" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <Bar className="h-3 w-28" />
          <Bar className="mx-auto mt-6 h-44 w-44 rounded-full" />
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <Bar className="h-3 w-28" />
          <Bar className="mt-6 h-44 w-full" />
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <Bar className="h-3 w-40" />
        <Bar className="mt-6 h-48 w-full" />
      </div>
    </div>
  )
}
