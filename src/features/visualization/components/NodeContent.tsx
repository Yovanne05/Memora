import { NODE_COLORS } from "../constants/visualization.constants"

interface NodeContentProps {
  title: string
  connections: number
}

export function NodeContent({ title, connections }: NodeContentProps) {
  const connectionText = `${connections} connexion${connections !== 1 ? "s" : ""}`

  return (
    <>
      <div className="flex items-center gap-2">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: NODE_COLORS.DEFAULT }}
          aria-hidden="true"
        />
        <div className="text-sm font-semibold text-gray-800">{title}</div>
      </div>

      <div className="mt-1 text-xs text-gray-500" aria-label={connectionText}>
        {connectionText}
      </div>
    </>
  )
}
