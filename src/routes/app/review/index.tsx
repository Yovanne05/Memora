import RevisionPage from '@/features/revision/pages/RevisionPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/review/')({
  component: RevisionPage,
})
