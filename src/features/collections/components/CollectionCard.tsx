import type { Collection } from "../types"
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
  const createdDate = new Date(collection.createdAt).toLocaleDateString(
    "fr-FR",
    { day: "2-digit", month: "short", year: "numeric" }
  )
  
  const router = useRouter()
  return (
    <Card
      className="flex cursor-pointer flex-col justify-between rounded-2xl border-slate-200 bg-white shadow-sm hover:border-slate-300"
      onClick={() => router.navigate({ to: '/collections/$collectionId', params: { collectionId: collection.id },})
} 
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/90 text-white">
            <FileText className="h-5 w-5" />
          </div>

          <div>
            <CardTitle className="text-base">{collection.name}</CardTitle>
            {collection.description && (
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">
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
              className="h-8 w-8 text-slate-500 hover:text-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuItem onClick={() => onEdit?.(collection)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-700"
              onClick={() => onDelete?.(collection)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {collection.notesCount} notes
          </span>

          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" />
            {collection.collaboratorsCount} collaborators
          </span>
        </div>

        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={
              collection.visibility === "public"
                ? "border-emerald-500/40 bg-emerald-50 text-emerald-700"
                : "border-slate-300 bg-slate-50 text-slate-700"
            }
          >
            {collection.visibility === "public" ? "Public" : "Private"}
          </Badge>

          <span className="text-xs text-slate-400">
            Created {createdDate}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
