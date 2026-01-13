import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EdgeLabelSelector } from './EdgeLabelSelector'

interface VisualizationHeaderProps {
  notesCount: number
  connectionsCount: number
  onBack?: () => void
  edgeLabelFilter?: {
    availableLabels: string[]
    selectedLabel: string | null
    selectLabel: (label: string | null) => void
  }
}

export function VisualizationHeader({
  notesCount,
  connectionsCount,
  onBack,
  edgeLabelFilter,
}: VisualizationHeaderProps) {
  return (
    <div className="border-b bg-background px-4 py-3">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex min-w-0 items-center gap-2">
          {onBack && (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-2"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Retour aux collections</span>
            </Button>
          )}

          <p className="truncate text-xs text-muted-foreground">
            <span aria-label={`${notesCount} notes`}>{notesCount} notes</span>
            {' / '}
            <span aria-label={`${connectionsCount} connexions`}>
              {connectionsCount} connexions
            </span>
          </p>
        </div>

        {edgeLabelFilter && (
          <EdgeLabelSelector
            availableLabels={edgeLabelFilter.availableLabels}
            selectedLabel={edgeLabelFilter.selectedLabel}
            onSelectLabel={edgeLabelFilter.selectLabel}
          />
        )}
      </div>
    </div>
  )
}
