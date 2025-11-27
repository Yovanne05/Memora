import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
} from '@tanstack/react-router'
import { useRouter } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import App from './App'
import CollectionsListPage from './features/collections/pages/CollectionsListPage'
import { CollectionsDetailsPage } from './features/collections/pages/CollectionsDetailsPage'
import { fetchCollectionById } from './features/collections/api' // adapte le chemin

// Root route
const rootRoute = createRootRoute({
  component: App,
})

// Page d’accueil
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <div>Accueil Flash Notes</div>,
})

// Liste des collections
const collectionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/collections',
  component: CollectionsListPage,
})

// Détails d’une collection
const collectionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/collections/$collectionId',
  component: CollectionDetailRoute,
})

function CollectionDetailRoute() {
  const { collectionId } = collectionDetailRoute.useParams()
  const router = useRouter()

  const { data: collection, isLoading, isError } = useQuery({
    queryKey: ['collection', collectionId],
    queryFn: () => fetchCollectionById(collectionId),
  })

  if (isLoading) return <p>Chargement...</p>
  if (isError || !collection) return <p>Collection introuvable</p>

  return (
    <CollectionsDetailsPage
      collection={collection}
      onBack={() => router.navigate({ to: '/collections' })}
      onEdit={(c) => {
        console.log('Edit collection', c)
      }}
    />
  )
}

// Arbre de routes
const routeTree = rootRoute.addChildren([
  indexRoute,
  collectionsRoute,
  collectionDetailRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function AppRouter() {
  return <RouterProvider router={router} />
}
