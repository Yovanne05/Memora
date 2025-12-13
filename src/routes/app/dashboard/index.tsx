import DashBoardPage from '@/features/dashboard/pages/DashboardPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/dashboard/')({
  component: DashBoardPage,
})

