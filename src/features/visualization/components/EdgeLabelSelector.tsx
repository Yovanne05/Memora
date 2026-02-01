import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getLabelColor } from '../lib/edgeColors'

interface EdgeLabelSelectorProps {
  readonly availableLabels: string[]
  readonly selectedLabel: string | null
  readonly onSelectLabel: (label: string | null) => void
}

export function EdgeLabelSelector({
  availableLabels,
  selectedLabel,
  onSelectLabel,
}: Readonly<EdgeLabelSelectorProps>) {
  if (availableLabels.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
        Filtrer par type :
      </span>
      <Select
        value={selectedLabel ?? 'all'}
        onValueChange={(value) => onSelectLabel(value === 'all' ? null : value)}
      >
        <SelectTrigger className="w-[160px] sm:w-[180px]">
          <SelectValue placeholder="Tous les liens" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les liens</SelectItem>
          {availableLabels.map((label) => (
            <SelectItem key={label} value={label}>
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: getLabelColor(label) }}
                />
                <span>{label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
