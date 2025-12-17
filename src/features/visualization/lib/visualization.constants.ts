export const CONNECTION_THRESHOLDS = {
  HIGH: 3,
  MEDIUM: 1,
} as const

export const NODE_COLORS = {
  HIGH: "#3b82f6", // blue-500
  MEDIUM: "#60a5fa", // blue-400
  LOW: "#93c5fd", // blue-300
  DEFAULT: "#3b82f6", // blue-500
} as const

export const LEGEND_COLORS = {
  HIGH: "bg-blue-600",
  MEDIUM: "bg-blue-400",
  LOW: "bg-blue-200",
} as const

export const LEGEND_LABELS = {
  HIGH: "3+ connexions",
  MEDIUM: "2-3 connexions",
  LOW: "0-1 connexion",
} as const

export const REACT_FLOW_STYLES = {
  EDGE_COLOR: "#3b82f6",
  EDGE_WIDTH: 2,
  EDGE_BORDER_RADIUS: 16,
} as const

export function getNodeColorByConnections(connections: number): string {
  if (connections > CONNECTION_THRESHOLDS.HIGH) return NODE_COLORS.HIGH
  if (connections > CONNECTION_THRESHOLDS.MEDIUM) return NODE_COLORS.MEDIUM
  return NODE_COLORS.LOW
}
