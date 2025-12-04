import { Handle, Position } from "reactflow"

type HandleSide = "top" | "right" | "bottom" | "left"
type HandleType = "source" | "target"

interface NodeHandleProps {
  position: Position
  side: HandleSide
}

const HANDLE_CLASS =
  "h-2! w-2! bg-blue-500! opacity-0 transition-opacity group-hover:opacity-100"

const createHandleId = (side: HandleSide, type: HandleType): string => {
  return `${side}-${type}`
}

export function NodeHandle({ position, side }: NodeHandleProps) {
  return (
    <>
      <Handle
        type="source"
        position={position}
        id={createHandleId(side, "source")}
        className={HANDLE_CLASS}
        aria-hidden="true"
      />
      <Handle
        type="target"
        position={position}
        id={createHandleId(side, "target")}
        className={HANDLE_CLASS}
        aria-hidden="true"
      />
    </>
  )
}
