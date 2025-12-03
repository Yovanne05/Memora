import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface NoteDetailsErrorProps {
  message?: string
  onRetry?: () => void
}

export function NoteDetailsError({ message, onRetry }: NoteDetailsErrorProps) {
  return (
    <div className="p-6">
      <Card className="border border-destructive/40 bg-destructive/5">
        <CardHeader className="flex flex-row items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-lg text-destructive">Impossible de charger la note</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>{message ?? "Un problème est survenu, veuillez réessayer."}</span>
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              Réessayer
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

