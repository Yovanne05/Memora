import { LEGEND_COLORS, LEGEND_LABELS } from "../constants/visualization.constants"

interface LegendItem {
  color: string
  label: string
}

const LEGEND_ITEMS: LegendItem[] = [
  { color: LEGEND_COLORS.HIGH, label: LEGEND_LABELS.HIGH },
  { color: LEGEND_COLORS.MEDIUM, label: LEGEND_LABELS.MEDIUM },
  { color: LEGEND_COLORS.LOW, label: LEGEND_LABELS.LOW },
]

export function VisualizationLegend() {
  return (
    <div className="border-t bg-background px-4 py-2">
      <div className="flex items-center gap-4 text-xs">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`h-3 w-3 rounded ${item.color}`} />
            <span className="text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
