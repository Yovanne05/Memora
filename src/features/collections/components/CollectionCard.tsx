import type { Collection } from "../models/collection.model"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { FileText, MoreHorizontal, Users } from "lucide-react"
import { useRouter } from "@tanstack/react-router"

interface CollectionCardProps {
  collection: Collection
  onEdit?: (c: Collection) => void
  onDelete?: (c: Collection) => void
}

export function CollectionCard({
  collection,
  onEdit,
  onDelete,
}: CollectionCardProps) {
  const createdDate = new Date(collection.createdAt).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  const router = useRouter()

  const handleNavigate = () =>
    router.navigate({
      to: "/app/collections/$collectionId",
      params: { collectionId: collection.id },
    })

  return (
    <Card
      className="group flex h-full cursor-pointer flex-col justify-between border border-border bg-card text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      onClick={handleNavigate}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="space-y-1">
            <CardTitle className="text-base">{collection.name}</CardTitle>
            {collection.description && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {collection.description}
              </p>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                onEdit?.(collection)
              }}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                onDelete?.(collection)
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            {collection.notesCount} notes
          </span>

          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {collection.collaboratorsCount} collaborators
          </span>
        </div>

        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={
              collection.visibility === "public"
                ? "border-emerald-400/50 bg-emerald-50 text-emerald-700"
                : "border-border bg-muted text-foreground"
            }
          >
            {collection.visibility === "public" ? "Public" : "Private"}
          </Badge>

          <span className="text-xs text-muted-foreground">Created {createdDate}</span>
        </div>
      </CardContent>
    </Card>
  )
}
