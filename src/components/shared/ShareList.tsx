import { Users } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ShareListItem } from './ShareListItem'
import type { Share } from './share-dialog/types'
import type { SharePermission } from '@/features/notes/dtos/note-share.dto'

interface ShareListProps {
  shares: Share[]
  onUpdatePermission: (userId: string, permission: SharePermission) => void
  onRemove: (userId: string) => void
}

export function ShareList({
  shares,
  onUpdatePermission,
  onRemove,
}: ShareListProps) {
  if (shares.length === 0) {
    return (
      <ScrollArea className="h-[300px]">
        <div className="flex flex-col items-center justify-center py-8">
          <Users className="h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            No users shared yet
          </p>
        </div>
      </ScrollArea>
    )
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-2">
        {shares.map((share) => (
          <ShareListItem
            key={share.userId}
            userId={share.userId}
            userLabel={share.userLabel}
            permission={share.permission}
            onUpdatePermission={onUpdatePermission}
            onRemove={onRemove}
          />
        ))}
      </div>
    </ScrollArea>
  )
}
