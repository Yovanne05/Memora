import SettingsPage from '@/features/settings/pages/SettingsPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/settings/')({
  component: SettingsPage,
})