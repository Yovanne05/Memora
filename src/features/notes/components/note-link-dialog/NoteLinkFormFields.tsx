import { memo } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface NoteLinkFormFieldsProps {
  linkLabel: string
  searchQuery: string
  onLinkLabelChange: (value: string) => void
  onSearchQueryChange: (value: string) => void
}

export const NoteLinkFormFields = memo(function NoteLinkFormFields({
  linkLabel,
  searchQuery,
  onLinkLabelChange,
  onSearchQueryChange,
}: Readonly<NoteLinkFormFieldsProps>) {
  const normalizedLabel = linkLabel.trim()

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="note-link-label" className="text-sm font-medium">
          Nom du lien
        </label>
        <Input
          id="note-link-label"
          value={linkLabel}
          onChange={(event) => onLinkLabelChange(event.target.value)}
          maxLength={80}
        />
        <p className="text-xs text-muted-foreground">
          {normalizedLabel.length}/80
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une note..."
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  )
})
