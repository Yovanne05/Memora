import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/notes/$id/edit/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <div>Hello edit note {id}!</div>
}
