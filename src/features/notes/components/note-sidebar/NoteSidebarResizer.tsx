import { cn } from "@/lib/utils"

type NoteSidebarResizerProps = {
  isResizing: boolean
  onResizeStart: (event: React.MouseEvent | React.PointerEvent | React.TouchEvent) => void
}

export function NoteSidebarResizer({
  isResizing,
  onResizeStart,
}: Readonly<NoteSidebarResizerProps>) {
  return (
    <button
      type="button"
      onMouseDown={onResizeStart}
      onPointerDown={onResizeStart}
      onTouchStart={onResizeStart}
      aria-label="Redimensionner la barre latérale"
      className={cn(
        "absolute left-0 top-0 h-full w-1 cursor-ew-resize hover:bg-primary/50 transition-colors group",
        isResizing && "bg-primary"
      )}
      onClick={(event) => event.preventDefault()}
    >
      <span className="sr-only">Redimensionner</span>
      <div className="absolute left-0 top-0 h-full w-4 -translate-x-1.5" />
    </button>
  )
}
