import { Network } from "lucide-react"
import { Button } from "@/components/ui/button"

type WorkspaceGraphButtonProps = {
  onClick: () => void
}

export function WorkspaceGraphButton({ onClick }: Readonly<WorkspaceGraphButtonProps>) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} className="gap-2">
      <Network className="h-4 w-4" />
      Graphe
    </Button>
  )
}
