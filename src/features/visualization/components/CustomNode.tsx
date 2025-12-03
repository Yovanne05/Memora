import { Position, type NodeProps } from "reactflow"
import { NodeHandle } from "./NodeHandle"
import { NodeContent } from "./NodeContent"

export interface CustomNodeData {
  title: string
  connections: number
}

const HANDLE_POSITIONS = [
  { position: Position.Top, side: "top" },
  { position: Position.Right, side: "right" },
  { position: Position.Bottom, side: "bottom" },
  { position: Position.Left, side: "left" },
] as const

export function CustomNode({ data }: NodeProps<CustomNodeData>) {
  const connections = data.connections ?? 0
  const connectionText = `${connections} connexion${connections !== 1 ? "s" : ""}`

  return (
    <div
      className="group relative min-w-[140px] rounded-lg border-2 border-blue-400 bg-white px-4 py-3 shadow-lg transition-colors hover:border-blue-600"
      role="article"
      aria-label={`Note: ${data.title}, ${connectionText}`}
    >
      {HANDLE_POSITIONS.map(({ position, side }) => (
        <NodeHandle key={side} position={position} side={side} />
      ))}

      <NodeContent title={data.title} connections={connections} />
    </div>
  )
}
