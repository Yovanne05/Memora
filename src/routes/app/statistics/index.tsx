import StatisticsPage from "@/features/statistics/components/pages/StatisticsPage"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/app/statistics/")({
  component: RouteComponent,
})

function RouteComponent() {
  return <StatisticsPage />
}
