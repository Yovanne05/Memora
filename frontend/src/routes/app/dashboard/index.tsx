import StatisticsPage from '@/features/statistics/pages/StatisticsPage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/features/auth/hooks/useAuth'

export const Route = createFileRoute('/app/dashboard/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
  return isAdmin ? <DashboardPage /> : <StatisticsPage />
}
