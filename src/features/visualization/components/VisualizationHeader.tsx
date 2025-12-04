import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VisualizationHeaderProps {
  notesCount: number
  connectionsCount: number
  onBack?: () => void
}

export function VisualizationHeader({
  notesCount,
  connectionsCount,
  onBack,
}: VisualizationHeaderProps) {
  return (
    <div className="border-b bg-background px-4 py-3">
      {onBack && (
        <Button
          variant="outline"
          size="sm"
          className="mb-2 w-fit gap-2"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux collections
        </Button>
      )}

      <p className="mt-0.5 text-xs text-muted-foreground">
        <span aria-label={`${notesCount} notes`}>{notesCount} notes</span>
        {" / "}
        <span aria-label={`${connectionsCount} connexions`}>
          {connectionsCount} connexions
        </span>
      </p>
    </div>
  )
}
