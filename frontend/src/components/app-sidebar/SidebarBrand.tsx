import { brandIcon } from "./constants"

export function SidebarBrand() {
  const BrandIcon = brandIcon

  return (
    <div className="px-6 py-6">
      <div className="flex items-center gap-4">
        <BrandIcon className="h-5 w-5" />
        <div>
          <h1 className="font-semibold text-lg leading-tight">Memora</h1>
          <p className="text-sm text-muted-foreground -mt-1">
            Base de connaissances
          </p>
        </div>
      </div>
    </div>
  )
}
