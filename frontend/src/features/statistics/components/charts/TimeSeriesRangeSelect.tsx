import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { StatisticsRangeDays } from "../../types/statistics-types"

type Props = {
  readonly value: StatisticsRangeDays
  readonly onChange: (value: StatisticsRangeDays) => void
}

export function TimeseriesRangeSelect({ value, onChange }: Readonly<Props>) {
  return (
    <Select
      value={String(value)}
      onValueChange={(v) => onChange(Number(v) as StatisticsRangeDays)}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Période" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7">7 jours</SelectItem>
        <SelectItem value="30">30 jours</SelectItem>
        <SelectItem value="90">90 jours</SelectItem>
      </SelectContent>
    </Select>
  )
}
