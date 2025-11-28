import { createFileRoute } from '@tanstack/react-router'

import { CollectionsListPage } from '@/features/collections'

export const Route = createFileRoute('/app/collections/')({
  component: CollectionsListPage,
})
