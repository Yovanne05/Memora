import { createFileRoute } from '@tanstack/react-router'
import { CollectionGraphPage } from '@/features/visualization/pages/CollectionGraphPage'

export const Route = createFileRoute('/app/visualization/collections/$id/')({
  component: CollectionGraphPage,
})
