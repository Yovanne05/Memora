import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { ShareForm } from "../ShareForm"
import { ShareList } from "../ShareList"
import type { Share } from "./types"
import type { SharePermission } from "@/features/notes/dtos/note-share.dto"
import type { User } from "@/features/users/models/user.model"

type ShareDialogBodyProps = {
  title: string
  description?: string
  shares: Share[]
  selectedUser: User | null
  permission: SharePermission
  excludedUserIds: string[]
  isLoading?: boolean
  onUserChange: (user: User | null) => void
  onPermissionChange: (permission: SharePermission) => void
  onSubmit: () => void
  onUpdatePermission: (userId: string, permission: SharePermission) => void
  onRemove: (userId: string) => void
  contentProps?: React.ComponentProps<typeof DialogContent>
}

export function ShareDialogBody({
  title,
  description,
  shares,
  selectedUser,
  permission,
  excludedUserIds,
  isLoading,
  onUserChange,
  onPermissionChange,
  onSubmit,
  onUpdatePermission,
  onRemove,
  contentProps,
}: Readonly<ShareDialogBodyProps>) {
  return (
    <DialogContent className="max-w-md" {...contentProps}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>

      <div className="space-y-4">
        <ShareForm
          selectedUser={selectedUser}
          permission={permission}
          excludedUserIds={excludedUserIds}
          isLoading={isLoading ?? false}
          onUserChange={onUserChange}
          onPermissionChange={onPermissionChange}
          onSubmit={onSubmit}
        />

        <Separator />

        <ShareList
          shares={shares}
          onUpdatePermission={onUpdatePermission}
          onRemove={onRemove}
        />
      </div>
    </DialogContent>
  )
}
