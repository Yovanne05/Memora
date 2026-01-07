import type { ReactNode } from "react"

import { CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import type { ResourceCardAction } from "./types"
import { ResourceCardActions } from "./ResourceCardActions"
import type { LucideIcon } from "lucide-react"

type ResourceCardHeaderProps = {
  id: string
  title: string
  description?: string | null
  icon: LucideIcon
  actions: ResourceCardAction[]
  headerActions?: ReactNode
  selectionMode: boolean
  isSelected: boolean
  compact: boolean
  readOnly: boolean
  onToggleSelection?: (id: string) => void
}

export function ResourceCardHeader({
  id,
  title,
  description,
  icon: Icon,
  actions,
  headerActions,
  selectionMode,
  isSelected,
  compact,
  readOnly,
  onToggleSelection,
}: Readonly<ResourceCardHeaderProps>) {
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <CardHeader
      className={`flex flex-row items-start justify-between gap-3 ${
        compact ? "pb-1" : "pb-2"
      }`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {selectionMode && (
          <div className="pt-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelection?.(id)}
              onClick={stopPropagation}
              aria-label={isSelected ? "Désélectionner" : "Sélectionner"}
            />
          </div>
        )}

        <div
          className={`flex items-center justify-center rounded-lg border border-border bg-muted shrink-0 ${
            compact ? "h-8 w-8" : "h-10 w-10"
          }`}
        >
          <Icon
            className={`text-muted-foreground ${compact ? "h-4 w-4" : "h-5 w-5"}`}
            aria-hidden="true"
          />
        </div>

        <div className="space-y-1 flex-1 min-w-0">
          <CardTitle className={compact ? "text-sm" : "text-base"}>
            {title}
          </CardTitle>
          {description && (
            <p
              className={`line-clamp-2 text-muted-foreground ${
                compact ? "text-xs" : "text-sm"
              }`}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      <ResourceCardActions
        actions={actions}
        headerActions={headerActions}
        selectionMode={selectionMode}
        readOnly={readOnly}
        onStopPropagation={stopPropagation}
      />
    </CardHeader>
  )
}
