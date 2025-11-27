import { CollectionsListPage } from '@/features/collections'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/collections/')({
  component: CollectionsListPage,
})
