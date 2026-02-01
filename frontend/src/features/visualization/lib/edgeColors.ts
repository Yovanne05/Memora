import { REACT_FLOW_STYLES } from './visualization.constants'

const LABEL_COLORS = [
  'hsl(217, 65%, 55%)', // Bleu pastel
  'hsl(0, 60%, 60%)', // Rouge pastel
  'hsl(142, 55%, 50%)', // Vert pastel
  'hsl(38, 70%, 55%)', // Orange pastel
  'hsl(258, 60%, 65%)', // Violet pastel
  'hsl(330, 60%, 60%)', // Rose pastel
  'hsl(173, 55%, 45%)', // Cyan pastel
  'hsl(25, 70%, 58%)', // Orange-brun pastel
  'hsl(280, 50%, 60%)', // Mauve pastel
  'hsl(78, 55%, 50%)', // Vert-jaune pastel
]

export function getLabelColor(label: string): string {
  if (!label) return REACT_FLOW_STYLES.EDGE_COLOR

  let hash = 0
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash)
  }

  const index = Math.abs(hash) % LABEL_COLORS.length
  return LABEL_COLORS[index]
}
