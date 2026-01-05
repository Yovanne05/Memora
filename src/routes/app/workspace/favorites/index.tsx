import FavoritesView from "@/features/workspace/pages/FavoriteView"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/app/workspace/favorites/")({
  component: RouteComponent,
})

function RouteComponent() {
  return <FavoritesView />
}
