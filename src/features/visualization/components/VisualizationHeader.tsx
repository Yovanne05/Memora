interface VisualizationHeaderProps {
  notesCount: number
  connectionsCount: number
}

export function VisualizationHeader({
  notesCount,
  connectionsCount,
}: VisualizationHeaderProps) {
  return (
    <div className="border-b bg-background px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Visualisation des Notes</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            <span aria-label={`${notesCount} notes`}>{notesCount} notes</span>
            {" • "}
            <span aria-label={`${connectionsCount} connexions`}>
              {connectionsCount} connexions
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
