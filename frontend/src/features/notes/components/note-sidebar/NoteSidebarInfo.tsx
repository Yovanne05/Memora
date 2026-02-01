import { Calendar } from "lucide-react"

type NoteSidebarInfoProps = {
  createdAt: string
  updatedAt: string
}

export function NoteSidebarInfo({
  createdAt,
  updatedAt,
}: Readonly<NoteSidebarInfoProps>) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">Informations</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>Créée le {createdAt}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>Modifiée le {updatedAt}</span>
        </div>
      </div>
    </div>
  )
}
