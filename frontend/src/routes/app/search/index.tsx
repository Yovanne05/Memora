import SearchPage from '@/features/search/pages/SearchPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/search/')({
  component: SearchPage,
})