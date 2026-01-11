import { Button } from '@/components/ui/button'
import { UserSearchCombobox } from './UserSearchCombobox'
import { SharePermissionSelect } from './SharePermissionSelect'
import type { User } from '@/features/users/models/user.model'
import type { SharePermission } from '@/features/notes/dtos/note-share.dto'

interface ShareFormProps {
  selectedUser: User | null
  permission: SharePermission
  excludedUserIds: string[]
  isLoading: boolean
  onUserChange: (user: User | null) => void
  onPermissionChange: (permission: SharePermission) => void
  onSubmit: () => void
}

export function ShareForm({
  selectedUser,
  permission,
  excludedUserIds,
  isLoading,
  onUserChange,
  onPermissionChange,
  onSubmit,
}: Readonly<ShareFormProps>) {
  return (
    <div className="flex gap-2">
      <UserSearchCombobox
        value={selectedUser?.id}
        onChange={onUserChange}
        excludeUserIds={excludedUserIds}
        disabled={isLoading}
      />
      <SharePermissionSelect
        value={permission}
        onChange={onPermissionChange}
        disabled={isLoading}
      />
      <Button
        onClick={onSubmit}
        disabled={!selectedUser || isLoading}
        size="sm"
      >
        Add
      </Button>
    </div>
  )
}
