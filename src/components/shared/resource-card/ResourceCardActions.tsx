import { MoreVertical } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ResourceCardAction } from './types'

type ResourceCardActionsProps = {
  actions: ResourceCardAction[]
  headerActions?: React.ReactNode
  readOnly: boolean
  selectionMode: boolean
  onStopPropagation: (e: React.MouseEvent) => void
}

export function ResourceCardActions({
  actions,
  headerActions,
  readOnly,
  selectionMode,
  onStopPropagation,
}: Readonly<ResourceCardActionsProps>) {
  const hasActions = actions.length > 0 || headerActions

  if (selectionMode || readOnly || !hasActions) {
    return null
  }

  return (
    <div className="flex items-center gap-1">
      {headerActions}

      {actions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
              onClick={onStopPropagation}
              aria-label="Options"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" onClick={onStopPropagation}>
            {actions.map((action) => (
              <DropdownMenuItem
                key={action.label}
                className={`cursor-pointer ${
                  action.variant === 'destructive'
                    ? 'text-destructive focus:text-destructive'
                    : ''
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
  )
}
