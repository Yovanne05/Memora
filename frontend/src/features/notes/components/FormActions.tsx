import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface FormActionsProps {
  loading: boolean
  deleteLoading?: boolean
  onDelete?: () => void
  children?: ReactNode
}

export function FormActions({
  loading,
  deleteLoading = false,
  onDelete,
  children,
}: Readonly<FormActionsProps>) {
  return (
    <Card className="shrink-0 border border-border/70 shadow-sm">
      <CardContent className="space-y-4 p-4 lg:p-6">
        {/* Settings fields (Collection, Visibility, Tags) */}
        <div className="w-full">{children}</div>

        {/* Action buttons */}
        {onDelete && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="destructive"
              className="gap-2"
              onClick={onDelete}
              disabled={deleteLoading || loading}
            >
              <Trash2 className="h-4 w-4" />
              {deleteLoading ? 'Suppression...' : 'Supprimer'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
