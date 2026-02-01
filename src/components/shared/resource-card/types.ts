import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

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
  actions?: ResourceCardAction[]
  headerActions?: ReactNode
  isSelected?: boolean
  selectionMode?: boolean
  compact?: boolean
  readOnly?: boolean
  metadata?: ReactNode
  footer?: ReactNode
  badges?: ReactNode
  className?: string
}
