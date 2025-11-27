import { Button } from "@/components/ui/button"

interface CollectionsHeaderProps {
  onCreate?: () => void
}

export function CollectionsHeader({ onCreate }: CollectionsHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Collections
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Organize your notes into focused learning spaces.
        </p>
      </div>

      <Button onClick={onCreate}>
        New collection
      </Button>
    </header>
  )
}
