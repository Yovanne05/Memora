import { type LucideIcon } from "lucide-react"
import { type ReactNode } from "react"

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

/**
 * Composant générique pour afficher un état vide
 * Remplace NotesEmptyState, CollectionsEmptyState, etc.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: Readonly<EmptyStateProps>) {
  return (
    <div
      className={`flex h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 text-center ${className}`}
    >
      <Icon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      <div>
        <p className="font-medium text-foreground">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
