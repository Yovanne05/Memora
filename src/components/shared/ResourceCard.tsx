import { memo, type ReactNode } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, type LucideIcon } from "lucide-react"

export interface ResourceCardAction {
  label: string
  onClick: (e: React.MouseEvent) => void
  variant?: "default" | "destructive"
  icon?: LucideIcon
}

export interface ResourceCardProps {
  id: string
  title: string
  description?: string | null
  icon: LucideIcon
  onClick?: () => void
  onToggleSelection?: (id: string) => void

  // Actions
  actions?: ResourceCardAction[]
  headerActions?: ReactNode

  // État
  isSelected?: boolean
  selectionMode?: boolean
  compact?: boolean
  readOnly?: boolean

  // Contenu
  metadata?: ReactNode
  footer?: ReactNode
  badges?: ReactNode

  // Style
  className?: string
}

export const ResourceCard = memo(function ResourceCard({
  id,
  title,
  description,
  icon: Icon,
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

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const hasActions = actions.length > 0 || headerActions

  return (
    <Card
      className={`group flex h-full cursor-pointer flex-col justify-between border text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        isSelected ? "border-primary bg-primary/5" : "border-border bg-card"
      } ${className}`}
      onClick={handleCardClick}
    >
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
                aria-label={
                  isSelected ? "Désélectionner" : "Sélectionner"
                }
              />
            </div>
          )}

          <div
            className={`flex items-center justify-center rounded-lg border border-border bg-muted shrink-0 ${
              compact ? "h-8 w-8" : "h-10 w-10"
            }`}
          >
            <Icon
              className={`text-muted-foreground ${
                compact ? "h-4 w-4" : "h-5 w-5"
              }`}
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

        {!selectionMode && !readOnly && hasActions && (
          <div className="flex items-center gap-1">
            {headerActions}

            {actions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                    onClick={stopPropagation}
                    aria-label="Options"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" onClick={stopPropagation}>
                  {actions.map((action, index) => (
                    <DropdownMenuItem
                      key={index}
                      className={`cursor-pointer ${
                        action.variant === "destructive"
                          ? "text-destructive focus:text-destructive"
                          : ""
                      }`}
                      onClick={action.onClick}
                    >
                      {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className={`space-y-3 ${compact ? "pt-0 pb-2" : "pt-0"}`}>
        {badges && <div className="flex items-center gap-2">{badges}</div>}
        {metadata && <div className="flex flex-wrap items-center gap-3">{metadata}</div>}
        {footer}
      </CardContent>
    </Card>
  )
})
