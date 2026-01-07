import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CollectionsSort } from "../../lib/collections-query"

type CollectionsSortSelectProps = {
  value: CollectionsSort
  onChange: (value: CollectionsSort) => void
}

export function CollectionsSortSelect({
  value,
  onChange,
}: Readonly<CollectionsSortSelectProps>) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="Trier par" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="recent">Plus récentes</SelectItem>
        <SelectItem value="alphabetical">A-Z</SelectItem>
        <SelectItem value="notes-count">Nombre de notes</SelectItem>
      </SelectContent>
    </Select>
  )
}
