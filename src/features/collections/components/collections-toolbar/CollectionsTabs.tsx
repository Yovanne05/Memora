import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CollectionsTab } from "../../lib/collections-query"

type CollectionsTabsProps = {
  tab: CollectionsTab
  onChange: (value: CollectionsTab) => void
}

export function CollectionsTabs({ tab, onChange }: Readonly<CollectionsTabsProps>) {
  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        if (value === "shared" || value === "favorites") onChange(value)
        else onChange("mine")
      }}
      className="w-full md:w-auto"
    >
      <TabsList className="grid h-9 grid-cols-3">
        <TabsTrigger value="mine">Mes collections</TabsTrigger>
        <TabsTrigger value="shared">Partagées</TabsTrigger>
        <TabsTrigger value="favorites">Mes favoris</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
