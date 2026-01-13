import FavoritesView from '@/features/favorites/pages/FavoritesView'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/favorites/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <FavoritesView />
}
