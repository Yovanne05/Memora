import { createFileRoute } from '@tanstack/react-router'
import FolderSystemView from '@/features/workspace/pages/FolderSystemView'

export const Route = createFileRoute('/app/workspace/')({
  component: FolderSystemView,
})
