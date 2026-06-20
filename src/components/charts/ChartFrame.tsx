import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ChartFrame({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="px-6 pt-5 pb-0">
        <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pt-2 pb-4">{children}</CardContent>
    </Card>
  )
}

export function ChartEmpty({ title }: { title: string }) {
  return (
    <ChartFrame title={title}>
      <div className="flex h-[240px] items-center justify-center">
        <p className="text-sm text-muted-foreground">No expense data this month.</p>
      </div>
    </ChartFrame>
  )
}
