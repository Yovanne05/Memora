import { Handle, Position } from "reactflow"

interface NodeHandleProps {
  position: Position
  side: string
}

const HANDLE_CLASS =
  "h-2! w-2! bg-blue-500! opacity-0 transition-opacity group-hover:opacity-100"

export function NodeHandle({ position, side }: NodeHandleProps) {
  return (
    <>
      <Handle
        type="source"
        position={position}
        id={`${side}-source`}
        className={HANDLE_CLASS}
        aria-hidden="true"
      />
      <Handle
        type="target"
        position={position}
        id={`${side}-target`}
        className={HANDLE_CLASS}
        aria-hidden="true"
      />
    </>
  )
}
