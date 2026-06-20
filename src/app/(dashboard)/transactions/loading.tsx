function Bar({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

export default function TransactionsLoading() {
  return (
    <div className="space-y-6">
      <Bar className="h-6 w-32" />
      <div className="flex gap-3">
        <Bar className="h-9 w-36" />
        <Bar className="h-9 w-52" />
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex gap-4 border-b border-border px-4 py-3 last:border-0">
            <Bar className="h-4 w-24" />
            <Bar className="h-4 w-40" />
            <Bar className="h-4 w-20" />
            <Bar className="ml-auto h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
