import { createFileRoute } from "@tanstack/react-router"
import { CollectionsDetailsPage } from "@/features/collections/pages/CollectionsDetailsPage"

export const Route = createFileRoute("/app/collections/$id/")({
  component: CollectionsDetailsPage,
})
