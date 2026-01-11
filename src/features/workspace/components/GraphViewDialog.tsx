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
      <DialogContent className="h-[90vh] w-full max-w-[calc(100%-1rem)] p-4 sm:h-[95vh] sm:max-w-[95vw] sm:p-6">
        <DialogHeader>
          <DialogTitle>Graphe de connaissances</DialogTitle>
        </DialogHeader>

        <div className="flex h-full w-full flex-1 overflow-hidden">
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
