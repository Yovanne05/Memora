import type { ReactNode } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LineChart } from "lucide-react"

type Props = {
  readonly title: string
  readonly value: number
  readonly icon: ReactNode
  readonly active?: boolean
  readonly onSelectChart?: () => void
  readonly chartLabel?: string
}

export function SummaryCard({
  title,
  value,
  icon,
  active = false,
  onSelectChart,
  chartLabel = "Afficher le graphique",
}: Readonly<Props>) {
  return (
    <Card className={cn(active && "border-primary/40 bg-primary/5")}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-muted-foreground">{icon}</span>
          <span>{title}</span>
        </div>

        {onSelectChart ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 text-muted-foreground hover:text-foreground",
              active && "text-primary"
            )}
            onClick={onSelectChart}
            aria-pressed={active}
            aria-label={chartLabel}
            title={chartLabel}
          >
            <LineChart className="h-4 w-4" />
          </Button>
        ) : null}
      </CardHeader>

      <CardContent>
        <div className="text-3xl font-semibold tabular-nums">{value}</div>
      </CardContent>
    </Card>
  )
}
