import { createFileRoute, Outlet } from '@tanstack/react-router'
import { PanelLeft } from 'lucide-react'

import { SidebarProvider, useSidebar } from "@/components/ui/sidebar"
import { AppSidebar } from "@/shared/components/app-sidebar"
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/app')({
  component: RouteComponent,
})

function SidebarToggleButton() {
  const { open, toggleSidebar } = useSidebar()

  if (open) return null

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleSidebar}
      className="fixed top-4 left-4 z-40 shadow-lg"
      title="Ouvrir la sidebar"
    >
      <PanelLeft className="h-4 w-4" />
    </Button>
  )
}

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarToggleButton />
      <main className="flex flex-col flex-1">
        <div className="mx-4 my-4" >
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  )
}
