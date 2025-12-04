import { Position, type NodeProps } from "reactflow"
import { NodeHandle } from "./NodeHandle"
import { NodeContent } from "./NodeContent"

export interface CustomNodeData {
  title: string
  connections: number
}

type HandleSide = "top" | "right" | "bottom" | "left"

interface HandleConfig {
  position: Position
  side: HandleSide
}

const HANDLE_POSITIONS: readonly HandleConfig[] = [
  { position: Position.Top, side: "top" },
  { position: Position.Right, side: "right" },
  { position: Position.Bottom, side: "bottom" },
  { position: Position.Left, side: "left" },
] as const

const getConnectionLabel = (connections: number): string => {
  return `${connections} connexion${connections !== 1 ? "s" : ""}`
}

export function CustomNode({ data }: NodeProps<CustomNodeData>) {
  const connections = data.connections ?? 0
  const connectionLabel = getConnectionLabel(connections)

  return (
    <div
      className="group relative min-w-[140px] rounded-lg border-2 border-blue-400 bg-white px-4 py-3 shadow-lg transition-colors hover:border-blue-600"
      role="article"
      aria-label={`Note: ${data.title}, ${connectionLabel}`}
    >
      {HANDLE_POSITIONS.map(({ position, side }) => (
        <NodeHandle key={side} position={position} side={side} />
      ))}

      <NodeContent title={data.title} connections={connections} />
    </div>
  )
}
