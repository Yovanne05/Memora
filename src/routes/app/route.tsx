import { createFileRoute, Outlet } from '@tanstack/react-router'

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/shared/components/app-sidebar"
import { AppHeader } from '@/shared/components/app-header'

export const Route = createFileRoute('/app')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-col flex-1">
        <AppHeader />
        <Outlet />
      </main>
    </SidebarProvider>
  )
}
