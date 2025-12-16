import { createFileRoute, Outlet, Navigate, redirect, useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from '@/components/app-header'
import { getAccessToken } from '@/features/auth/lib/token-storage'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ApiError } from '@/lib/errors'

export const Route = createFileRoute('/app')({
  beforeLoad: ({ location }) => {
    const token = getAccessToken()
    if (!token) {
      throw redirect({
        to: "/auth/login",
        search: { redirect: location.href ?? location.pathname },
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const location = useLocation()
  const { isAuthenticated, isLoadingUser, authError, logout } = useAuth()

  useEffect(() => {
    if (authError instanceof ApiError && authError.status === 401) {
      logout()
    }
  }, [authError, logout])

  if (isLoadingUser) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground text-sm">
        Chargement de votre session...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" search={{ redirect: location.href ?? location.pathname }} />
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-col flex-1">
        <AppHeader />
        <div className="mx-4 my-4" >
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  )
}
