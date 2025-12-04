import { NODE_COLORS } from "../lib/visualization.constants"

interface NodeContentProps {
  title: string
  connections: number
}

const getConnectionText = (connections: number): string => {
  return `${connections} connexion${connections !== 1 ? "s" : ""}`
}

export function NodeContent({ title, connections }: NodeContentProps) {
  const connectionText = getConnectionText(connections)

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: NODE_COLORS.DEFAULT }}
          aria-hidden="true"
        />
        <h3 className="text-sm font-semibold text-gray-800 truncate">
          {title}
        </h3>
      </div>

      <p className="text-xs text-gray-500" aria-label={connectionText}>
        {connectionText}
      </p>
    </div>
  )
}
