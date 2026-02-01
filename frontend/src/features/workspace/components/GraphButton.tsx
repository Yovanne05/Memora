import { Network } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GraphButtonProps {
  readonly onClick: () => void
  readonly disabled?: boolean
}

export function GraphButton({ onClick, disabled = false }: GraphButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="gap-2"
    >
      <Network className="h-4 w-4" />
      <span className="hidden sm:inline">Graphe</span>
    </Button>
  )
}
