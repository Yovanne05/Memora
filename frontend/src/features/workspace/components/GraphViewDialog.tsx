import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CollectionVisualizationView } from '@/features/visualization/components/CollectionVisualizationView'
import { useWorkspaceContext } from '../context'

export function GraphViewDialog() {
  const { state, actions } = useWorkspaceContext()

  return (
    <Dialog open={state.graphViewOpen} onOpenChange={actions.closeGraphView}>
      <DialogContent className="flex h-[90vh] w-full max-w-[calc(100%-1rem)] flex-col gap-2 p-3 sm:h-[95vh] sm:max-w-[95vw] sm:gap-4 sm:p-6">
        <DialogHeader className="shrink-0">
          <DialogTitle>Graphe de connaissances</DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          {state.selectedCollectionId ? (
            <CollectionVisualizationView
              collectionId={state.selectedCollectionId}
              onBack={actions.closeGraphView}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-medium">
                  Aucune collection sélectionnée
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sélectionnez une collection dans la sidebar pour visualiser
                  son graphe
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
