import { VisualizationPage } from '@/features/visualization/pages/VisualizationPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/visualization/')({
  component: VisualizationPage,
})
