import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CollectionVisualizationView } from "@/features/visualization/components/CollectionVisualizationView"
import { useWorkspaceContext } from "../context"

export function GraphViewDialog() {
  const { state, actions } = useWorkspaceContext()

  return (
    <Dialog open={state.graphViewOpen} onOpenChange={actions.closeGraphView}>
      <DialogContent className="h-[95vh] max-w-[95vw]">
        <DialogHeader>
          <DialogTitle>Graphe de connaissances</DialogTitle>
        </DialogHeader>

        <div className="h-full flex-1">
          {state.selectedCollectionId ? (
            <CollectionVisualizationView
              collectionId={state.selectedCollectionId}
              onBack={actions.closeGraphView}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-medium">Aucune collection sélectionnée</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sélectionnez une collection dans la sidebar pour visualiser son graphe
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
