import { Handle, Position, type NodeProps } from "reactflow";
import { NODE_COLORS } from "../constants/visualization.constants";

export interface CustomNodeData {
  title: string;
  connections: number;
}

const HANDLE_POSITIONS = [
  { position: Position.Top, suffix: "top" },
  { position: Position.Right, suffix: "right" },
  { position: Position.Bottom, suffix: "bottom" },
  { position: Position.Left, suffix: "left" },
] as const;

const HANDLE_CLASS =
  "h-2! w-2! bg-blue-500! opacity-0 transition-opacity group-hover:opacity-100";

export function CustomNode({ data }: NodeProps<CustomNodeData>) {
  const connections = data.connections ?? 0;
  const connectionText = `${connections} connexion${connections !== 1 ? "s" : ""}`;

  return (
    <div
      className="group relative min-w-[140px] rounded-lg border-2 border-blue-400 bg-white px-4 py-3 shadow-lg transition-colors hover:border-blue-600"
      role="article"
      aria-label={`Note: ${data.title}, ${connectionText}`}
    >
      {HANDLE_POSITIONS.map(({ position, suffix }) => (
        <div key={suffix}>
          <Handle
            type="source"
            position={position}
            id={`${suffix}-source`}
            className={HANDLE_CLASS}
            aria-hidden="true"
          />
          <Handle
            type="target"
            position={position}
            id={`${suffix}-target`}
            className={HANDLE_CLASS}
            aria-hidden="true"
          />
        </div>
      ))}

      <div className="flex items-center gap-2">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: NODE_COLORS.DEFAULT }}
          aria-hidden="true"
        />
        <div className="text-sm font-semibold text-gray-800">{data.title}</div>
      </div>

      <div className="mt-1 text-xs text-gray-500" aria-label={connectionText}>
        {connectionText}
      </div>
    </div>
  );
}
