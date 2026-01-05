import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Save, Trash2 } from "lucide-react"

interface FormActionsProps {
  savedTime: string | null
  isUpdate: boolean
  loading: boolean
  deleteLoading?: boolean
  onCancel?: () => void
  onDelete?: () => void
}

export function FormActions({
  savedTime,
  isUpdate,
  loading,
  deleteLoading = false,
  onCancel,
  onDelete,
}: Readonly<FormActionsProps>) {
  return (
    <Card className="border border-border/70 shadow-sm">
      <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-foreground">
            <Check className="h-4 w-4" />
            <span className="font-medium">
              {savedTime ? `Enregistree ${savedTime}` : "Pas encore enregistree"}
            </span>
          </div>
          {isUpdate && (
            <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Mise a jour
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              className="gap-2"
              onClick={onCancel}
              disabled={loading}
            >
              Annuler
            </Button>
          )}
          {onDelete && (
            <Button
              type="button"
              variant="destructive"
              className="gap-2"
              onClick={onDelete}
              disabled={deleteLoading}
            >
              <Trash2 className="h-4 w-4" />
              {deleteLoading ? "Suppression..." : "Supprimer"}
            </Button>
          )}
          <Button className="gap-2" type="submit" disabled={loading}>
            <Save className="h-4 w-4" />
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
