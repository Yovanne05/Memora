import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/visualization/collections/$id/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/visualization/collections/$id/"!</div>
}
