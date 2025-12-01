import { Handle, Position, type NodeProps } from "reactflow";

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

const HANDLE_CLASS = "w-2! h-2! bg-blue-500! opacity-0 group-hover:opacity-100 transition-opacity";

export function CustomNode({ data }: NodeProps<CustomNodeData>) {
  const connections = data.connections ?? 0;

  return (
    <div className="group relative px-4 py-3 shadow-lg rounded-lg bg-white border-2 border-blue-400 hover:border-blue-600 transition-colors min-w-[140px]">
      {/* Handles pour toutes les directions (visibles au survol) */}
      {HANDLE_POSITIONS.map(({ position, suffix }) => (
        <div key={suffix}>
          <Handle
            type="source"
            position={position}
            id={`${suffix}-source`}
            className={HANDLE_CLASS}
          />
          <Handle
            type="target"
            position={position}
            id={`${suffix}-target`}
            className={HANDLE_CLASS}
          />
        </div>
      ))}

      {/* Contenu du nœud */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-500" />
        <div className="text-sm font-semibold text-gray-800">{data.title}</div>
      </div>

      {/* Indicateur de connexions */}
      <div className="text-xs text-gray-500 mt-1">
        {connections} connexion{connections > 1 ? "s" : ""}
      </div>
    </div>
  );
}
