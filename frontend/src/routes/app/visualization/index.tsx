import { CollectionSelectionPage } from '@/features/visualization/pages/CollectionSelectionPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/visualization/')({
  component: CollectionSelectionPage,
})
