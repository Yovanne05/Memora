import type { SharePermission } from "@/features/notes/dtos/note-share.dto"

export interface Share {
  userId: string
  permission: SharePermission
  createdAt: Date
}

export interface ShareDialogProps {
  title: string
  description?: string
  shares: Share[]
  currentUserId: string
  onAddShare: (userId: string, permission: SharePermission) => Promise<void>
  onUpdateShare: (userId: string, permission: SharePermission) => Promise<void>
  onRemoveShare: (userId: string) => Promise<void>
  isLoading?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}
