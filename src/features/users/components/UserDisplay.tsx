import { Skeleton } from "@/components/ui/skeleton"
import { useUserDetails } from "../hooks/useUserDetails"

interface UserDisplayProps {
  userId: string
  fallback?: string
}

export function UserDisplay({ userId, fallback = "Utilisateur inconnu" }: Readonly<UserDisplayProps>) {
  const { data: user, isLoading, isError } = useUserDetails(userId)

  if (isLoading) {
    return <Skeleton className="h-4 w-24 inline-block" />
  }

  if (isError || !user) {
    return <span className="text-muted-foreground">{fallback}</span>
  }

  return <span>{user.username ?? user.email ?? fallback}</span>
}
