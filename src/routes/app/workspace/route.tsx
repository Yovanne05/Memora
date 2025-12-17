import { createFileRoute, Outlet } from "@tanstack/react-router"
import { WorkspaceProvider } from "@/features/workspace/context/WorkspaceContext"
import WorkspaceLayout from "@/features/workspace/components/WorkspaceLayout"

export const Route = createFileRoute("/app/workspace")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <WorkspaceProvider>
      <WorkspaceLayout>
        <Outlet />
      </WorkspaceLayout>
    </WorkspaceProvider>
  )
}
