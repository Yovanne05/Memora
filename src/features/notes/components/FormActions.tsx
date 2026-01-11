import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface FormActionsProps {
  loading: boolean
  deleteLoading?: boolean
  onCancel?: () => void
  onDelete?: () => void
  children?: ReactNode
}

export function FormActions({
  loading,
  deleteLoading = false,
  onCancel,
  onDelete,
  children,
}: Readonly<FormActionsProps>) {
  return (
    <Card className="shrink-0 border border-border/70 shadow-sm">
      <CardContent className="flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Settings fields (Collection, Visibility, Tags) */}
        <div className="flex flex-1">{children}</div>

        {/* Action buttons */}
        <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
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
              {deleteLoading ? 'Suppression...' : 'Supprimer'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
