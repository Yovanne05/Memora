import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { getContextualErrorMessage } from '@/lib/error-context'

import { Separator } from '@/components/ui/separator'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function LogoutSection() {
  const router = useRouter()
  const { logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      toast.success('Déconnexion effectuée.')
      router.navigate({
        to: '/auth/login',
        search: { redirect: '/app/dashboard' },
      })
    } catch (error) {
      const message = getContextualErrorMessage(error, {
        operation: 'delete',
        resource: 'user',
        fallback: 'Impossible de vous déconnecter.',
      })
      toast.error(message)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      <Separator className="mb-2" />
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>{isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  )
}
