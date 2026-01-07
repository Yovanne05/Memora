import { Eye, EyeOff } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { Note } from "../../models/note.model"

type NoteSidebarOverviewProps = {
  note: Note
}

export function NoteSidebarOverview({ note }: Readonly<NoteSidebarOverviewProps>) {
  const isPublic = note.visibility === "public"

  return (
    <div>
      <h1 className="text-2xl font-bold leading-tight mb-3">{note.title}</h1>
      <Badge
        variant={isPublic ? "default" : "secondary"}
        className="flex items-center gap-1 w-fit"
      >
        {isPublic ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
        {isPublic ? "Publique" : "Privée"}
      </Badge>
    </div>
  )
}
