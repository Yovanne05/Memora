import { memo } from "react"
import { Card } from "@/components/ui/card"
import { ResourceCardContent } from "./resource-card/ResourceCardContent"
import { ResourceCardHeader } from "./resource-card/ResourceCardHeader"
import type { ResourceCardProps } from "./resource-card/types"

export type { ResourceCardAction, ResourceCardProps } from "./resource-card/types"

export const ResourceCard = memo(function ResourceCard({
  id,
  title,
  description,
  icon,
  onClick,
  onToggleSelection,
  actions = [],
  headerActions,
  isSelected = false,
  selectionMode = false,
  compact = false,
  readOnly = false,
  metadata,
  footer,
  badges,
  className = "",
}: Readonly<ResourceCardProps>) {
  const handleCardClick = () => {
    if (selectionMode && onToggleSelection) {
      onToggleSelection(id)
      return
    }
    onClick?.()
  }

  return (
    <Card
      className={`group flex h-full cursor-pointer flex-col justify-between border text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        isSelected ? "border-primary bg-primary/5" : "border-border bg-card"
      } ${className}`}
      onClick={handleCardClick}
    >
      <ResourceCardHeader
        id={id}
        title={title}
        description={description}
        icon={icon}
        actions={actions}
        headerActions={headerActions}
        selectionMode={selectionMode}
        isSelected={isSelected}
        compact={compact}
        readOnly={readOnly}
        onToggleSelection={onToggleSelection}
      />
      <ResourceCardContent
        badges={badges}
        metadata={metadata}
        footer={footer}
        compact={compact}
      />
    </Card>
  )
})
