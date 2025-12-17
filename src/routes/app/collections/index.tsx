import { createFileRoute } from '@tanstack/react-router'
import { CollectionsListPage } from '@/features/collections/pages/CollectionsListPage'

export const Route = createFileRoute('/app/collections/')({
  component: CollectionsListPage,
})
