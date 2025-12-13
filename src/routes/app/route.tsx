import { createFileRoute, Outlet } from '@tanstack/react-router'

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from '@/components/app-header'

export const Route = createFileRoute('/app')({
  component: RouteComponent,
})

function RouteComponent() {
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
