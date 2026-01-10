import { AlertCircle, Users, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CollaborationStatusProps {
  isConnected: boolean
  isConnecting: boolean
  isSynced?: boolean
  activeUsers: { userId: string; username: string }[]
  typingUsers?: Set<string>
  error: Error | null
  onReconnect: () => void
}

export function CollaborationStatus({
  isConnected,
  isConnecting,
  activeUsers,
  error,
  onReconnect,
}: Readonly<CollaborationStatusProps>) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
      <div className="flex items-center gap-3">
        {isConnected && activeUsers.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {activeUsers.length}{' '}
              {activeUsers.length === 1 ? 'utilisateur' : 'utilisateurs'}
            </span>
            {activeUsers.length <= 3 && (
              <div className="flex gap-1">
                {activeUsers.map((user) => (
                  <span
                    key={user.userId}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    {user.username}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {error && (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error.message}</span>
          </div>
        )}
        {!isConnected && !isConnecting && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReconnect}
            className="h-7"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reconnecter
          </Button>
        )}
      </div>
    </div>
  )
}
