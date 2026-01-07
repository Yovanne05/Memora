import { forwardRef } from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"

type CollectionsSearchInputProps = {
  value: string
  onChange: (value: string) => void
}

export const CollectionsSearchInput = forwardRef<
  HTMLInputElement,
  CollectionsSearchInputProps
>(function CollectionsSearchInput({ value, onChange }, ref) {
  return (
    <div className="relative w-full min-w-60 lg:w-80">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={ref}
        placeholder="Rechercher des collections..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pl-9"
      />
    </div>
  )
})
