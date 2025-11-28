import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/notes/$id/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <div>Hello note {id}!</div>
}
