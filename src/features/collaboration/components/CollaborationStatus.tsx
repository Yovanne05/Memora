import {
  AlertCircle,
  Users,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
interface CollaborationStatusProps {
  isConnected: boolean
  isConnecting: boolean
  isSynced?: boolean
  activeUsers: { userId: string; username: string }[]
  typingUsers: Set<string>
  error: Error | null
  onReconnect: () => void
}
export function CollaborationStatus({
  isConnected,
  isConnecting,
  isSynced = true,
  activeUsers,
  typingUsers,
  error,
  onReconnect,
}: Readonly<CollaborationStatusProps>) {
  const typingUsersList = Array.from(typingUsers)
  const typingText =
    typingUsersList.length > 0
      ? typingUsersList.length === 1
        ? `${typingUsersList[0]} est en train d'écrire...`
        : `${typingUsersList.length} personnes sont en train d'écrire...`
      : null
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {isConnecting ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Connexion...
              </span>
            </>
          ) : isConnected ? (
            <>
              <Wifi className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">
                {isSynced ? 'Synchronisé' : 'Connecté'}
              </span>
              {isSynced && (
                <CheckCircle2 className="h-3 w-3 text-green-600 ml-1" />
              )}
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">Déconnecté</span>
            </>
          )}
        </div>
        {isConnected && activeUsers.length > 0 && (
          <div className="flex items-center gap-2 pl-3 border-l border-border">
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
        {typingText && (
          <div className="pl-3 border-l border-border">
            <span className="text-sm text-muted-foreground italic">
              {typingText}
            </span>
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
