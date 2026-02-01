import { X } from "lucide-react"

import { Button } from "@/components/ui/button"

type NoteSidebarHeaderProps = {
  onClose: () => void
}

export function NoteSidebarHeader({ onClose }: Readonly<NoteSidebarHeaderProps>) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b">
      <h2 className="text-lg font-semibold">Détails de la note</h2>
      <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
