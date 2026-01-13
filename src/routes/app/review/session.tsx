import { ReviewSessionPage } from '@/features/revision/components/ReviewSessionPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/review/session')({
  component: ReviewSessionPage,
})
